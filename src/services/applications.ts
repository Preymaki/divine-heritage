/**
 * Applications Service
 *
 * Handles online childcare application submissions, Firestore storage, resilient
 * local persistence backup, PDF generation, email notifications, and real-time
 * admin CMS subscriptions.
 *
 * Firestore Collection: `applications/`
 * Security Rules: Public create, Authenticated Admin read/update/delete.
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import type {
  ApplicationFormData,
  ApplicationRecord,
  ApplicationStatus,
} from '@appTypes/application'
import { generateApplicationPDF } from '@utils/pdfGenerator'

export const APPLICATIONS_COLLECTION = 'applications'
export const APPLICATIONS_STORAGE_KEY = 'divine_heritage_applications'
export const APPLICATIONS_EVENT = 'applications-changed'

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateApplicationId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DH-APP-${year}${month}${day}-${random}`
}

function getLocalApplications(): ApplicationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[applications] Failed to read localStorage:', err)
    return []
  }
}

function saveLocalApplications(items: ApplicationRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(APPLICATIONS_EVENT))
  } catch (err) {
    console.warn('[applications] Failed to write localStorage:', err)
  }
}

function parseAppTime(item: ApplicationRecord): number {
  if (!item.submittedAt) return 0
  const parsed = new Date(item.submittedAt).getTime()
  return isNaN(parsed) ? 0 : parsed
}

function mergeApplications(
  firestoreItems: ApplicationRecord[],
  localItems: ApplicationRecord[]
): ApplicationRecord[] {
  const map = new Map<string, ApplicationRecord>()

  for (const item of firestoreItems) {
    map.set(item.id, item)
  }

  for (const local of localItems) {
    if (!map.has(local.id)) {
      map.set(local.id, local)
    } else {
      const existing = map.get(local.id)!
      if (local.status && local.status !== existing.status) {
        map.set(local.id, { ...existing, status: local.status })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => parseAppTime(b) - parseAppTime(a))
}

// ── Public Submission ─────────────────────────────────────────────────────────

export interface SubmissionResult {
  success: boolean
  applicationId: string
  error?: string
}

/**
 * Submits an application:
 * 1. Generates unique reference ID (e.g. DH-APP-20260904-ABCD)
 * 2. Backs up locally in localStorage
 * 3. Writes record to Firestore `applications/{applicationId}`
 * 4. Generates PDF in memory
 * 5. Dispatches email notification to admin with PDF attachment
 * 6. Records delivery status without failing the application if email is unconfigured
 */
export async function submitApplication(
  formData: ApplicationFormData
): Promise<SubmissionResult> {
  const applicationId = generateApplicationId()
  const submittedAt = new Date().toISOString()

  const childName = formData.page1?.childFullName || formData.child?.fullName || 'Applicant Child'
  const childDob = formData.page1?.childDob || formData.child?.dob || '—'
  const parentName = formData.page1?.parent1Name || formData.parent1?.fullName || 'Parent / Guardian'
  const parentEmail = formData.page1?.parent1Email || formData.parent1?.email || ''
  const parentPhone = formData.page1?.parent1Mobile || formData.parent1?.mobile || ''
  const startDate = formData.page3?.requiredStartDate || formData.page4?.contractStartDate || formData.sessions?.requiredStartDate || '—'
  const contractedHours = formData.page3?.contractedHours?.totalHoursPerWeek || formData.contractedSchedule?.totalContractedHours || 0
  const weeklyCost = formData.page3?.contractedHours?.totalCostPerWeek || formData.contractedSchedule?.totalWeeklyCost || 0

  const record: ApplicationRecord = {
    ...formData,
    child: {
      fullName: childName,
      dob: childDob,
      sex: formData.page1?.childGender || formData.child?.sex || '',
      homeAddress: formData.page1?.parent1Address || '',
    },
    parent1: {
      fullName: parentName,
      email: parentEmail,
      mobile: parentPhone,
      homeAddress: formData.page1?.parent1Address || '',
    },
    sessions: {
      requiredStartDate: startDate,
    },
    contractedSchedule: {
      totalContractedHours: contractedHours,
      totalWeeklyCost: weeklyCost,
    },
    id: applicationId,
    applicationId,
    status: 'new',
    submittedAt,
    emailStatus: 'pending',
    emailError: null,
    emailSentAt: null,
    pdfGenerated: false,
  }

  // 1. Always save to localStorage first
  const currentLocal = getLocalApplications()
  saveLocalApplications([record, ...currentLocal])

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId)
    await setDoc(docRef, record)
  } catch (firestoreErr) {
    console.warn(
      '[applications] Firestore write failed or permission error; saved locally:',
      firestoreErr
    )
  }

  // 3. Generate PDF and dispatch email in background
  try {
    const { base64 } = await generateApplicationPDF(record)
    record.pdfGenerated = true

    // Attempt email delivery via serverless API or Firestore mail trigger
    let emailSent = false
    let emailErrorMsg: string | null = null

    try {
      const emailResponse = await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: record.applicationId,
          childName,
          parentName,
          parentEmail,
          parentPhone,
          submittedAt: record.submittedAt,
          startDate,
          contractedHours,
          weeklyCost,
          pdfBase64: base64,
        }),
      })

      if (emailResponse.ok) {
        emailSent = true
      } else {
        emailErrorMsg = `Email endpoint returned ${emailResponse.status}`
      }
    } catch {
      // If serverless endpoint is not hosted locally or unconfigured, try Firestore mail trigger
      try {
        const mailDocRef = doc(collection(db, 'mail'))
        await setDoc(mailDocRef, {
          to: ['Divineheritagechildcare@gmail.com'],
          message: {
            subject: `New Childcare Application: ${childName} (Ref: ${record.applicationId})`,
            text: `A new childcare application has been submitted for ${childName}.\nParent: ${parentName} (${parentPhone}, ${parentEmail})\nStart Date: ${startDate}\nTotal Hours: ${contractedHours} hrs/week.\n\nPlease log in to the Divine Heritage Admin Dashboard to download the complete PDF.`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
              <div style="background: #1e3a8a; padding: 18px; border-radius: 8px 8px 0 0; color: white;">
                <h2 style="margin: 0; font-size: 20px;">New Childcare Application Received</h2>
                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Ref: <strong>${record.applicationId}</strong></p>
              </div>
              <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff;">
                <p>A new application has been submitted on the Divine Heritage website:</p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Child Name:</td><td><strong>${childName}</strong></td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Date of Birth:</td><td>${childDob}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Parent / Guardian:</td><td><strong>${parentName}</strong></td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Contact Mobile:</td><td>${parentPhone}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Contact Email:</td><td>${parentEmail}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Target Start Date:</td><td>${startDate}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Weekly Hours:</td><td><strong>${contractedHours} hrs / week</strong></td></tr>
                </table>
                <p style="font-size: 13px; color: #475569;">The full 7-page application form and generated PDF are available in the Admin Dashboard.</p>
              </div>
            </div>`,
            attachments: [
              {
                filename: `Divine-Heritage-Application-${record.applicationId}.pdf`,
                path: base64,
              },
            ],
          },
        })
        emailSent = true
      } catch (triggerErr) {
        emailErrorMsg = triggerErr instanceof Error ? triggerErr.message : 'Email service unconfigured'
      }
    }

    record.emailStatus = emailSent ? 'sent' : 'unconfigured'
    record.emailSentAt = emailSent ? new Date().toISOString() : null
    record.emailError = emailErrorMsg

    // Update status in Firestore and localStorage
    const updatedList = getLocalApplications().map((item) =>
      item.id === record.id ? { ...record } : item
    )
    saveLocalApplications(updatedList)

    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId)
      await updateDoc(docRef, {
        pdfGenerated: record.pdfGenerated,
        emailStatus: record.emailStatus,
        emailSentAt: record.emailSentAt,
        emailError: record.emailError,
      })
    } catch {
      // Non-blocking
    }
  } catch (pdfErr) {
    console.warn('[applications] PDF or Email generation error:', pdfErr)
  }

  return {
    success: true,
    applicationId,
  }
}

// ── Admin Dashboard Subscription ──────────────────────────────────────────────

export function subscribeToApplications(
  onData: (applications: ApplicationRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  let firestoreDocs: ApplicationRecord[] = []

  const emitMerged = () => {
    const local = getLocalApplications()
    const merged = mergeApplications(firestoreDocs, local)
    onData(merged)
  }

  // Initial emit
  emitMerged()

  // Local storage listener
  const handleLocalChange = () => emitMerged()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleLocalChange)
    window.addEventListener(APPLICATIONS_EVENT, handleLocalChange)
  }

  // Firestore snapshot listener
  let firestoreUnsub: Unsubscribe = () => {}
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      orderBy('submittedAt', 'desc')
    )
    firestoreUnsub = onSnapshot(
      q,
      (snap) => {
        firestoreDocs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ApplicationRecord, 'id'>),
        }))
        emitMerged()
      },
      (err) => {
        console.warn('[applications] Firestore subscription error:', err.message)
        onError?.(err)
        emitMerged()
      }
    )
  } catch (err) {
    console.warn('[applications] Firestore init query error:', err)
    emitMerged()
  }

  return () => {
    firestoreUnsub()
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleLocalChange)
      window.removeEventListener(APPLICATIONS_EVENT, handleLocalChange)
    }
  }
}

// ── Admin Actions ─────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<void> {
  const localItems = getLocalApplications()
  const updated = localItems.map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
  )
  saveLocalApplications(updated)

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id)
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.warn('[applications] Remote status update error:', err)
  }
}

export async function deleteApplication(id: string): Promise<void> {
  const localItems = getLocalApplications()
  const filtered = localItems.filter((item) => item.id !== id)
  saveLocalApplications(filtered)

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (err) {
    console.warn('[applications] Remote delete error:', err)
  }
}

export async function downloadApplicationPDF(app: ApplicationRecord): Promise<void> {
  const { doc } = await generateApplicationPDF(app)
  const filename = `Divine-Heritage-Application-${app.applicationId || app.id}.pdf`
  doc.save(filename)
}
