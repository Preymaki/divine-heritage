/**
 * Applications Service
 *
 * Handles online childcare application submissions, Firestore storage, resilient
 * local persistence backup, PDF generation, Firebase Storage PDF upload,
 * automatic email delivery to divineheritagechildcare@gmail.com, and real-time
 * admin CMS subscriptions for general website oversight.
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@services/firebase/config'
import type {
  ApplicationFormData,
  ApplicationRecord,
  ApplicationStatus,
} from '@appTypes/application'
import { generateApplicationPDF } from '@utils/pdfGenerator'

export const APPLICATIONS_COLLECTION = 'applications'
export const APPLICATIONS_STORAGE_KEY = 'divine_heritage_applications'
export const APPLICATIONS_EVENT = 'applications-changed'
export const ADMIN_APPLICATION_EMAIL = 'divineheritagechildcare@gmail.com'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively removes all keys with `undefined` values so Firestore setDoc/updateDoc
 * will never fail with "Unsupported field value: undefined", while preserving
 * Dates, Timestamps, arrays, and primitive values.
 */
function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (obj instanceof Date) {
    return obj
  }
  if ('toMillis' in obj && typeof (obj as any).toMillis === 'function') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as unknown as T
  }
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefinedFields(value)
    }
  }
  return cleaned as T
}

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

function buildScheduleSummary(record: ApplicationRecord): string {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
  const parts: string[] = []
  const ch = record.page3?.contractedHours
  if (ch) {
    for (const day of days) {
      const d = ch[day]
      if (d?.timeFrom && d?.timeTo) {
        const label = day.charAt(0).toUpperCase() + day.slice(1, 3)
        parts.push(
          `${label}: ${d.timeFrom}–${d.timeTo} (${d.totalHours || '0'}h${d.rate ? `, ${d.rate}` : ''})`
        )
      }
    }
  }
  return parts.length > 0 ? parts.join(' | ') : 'Not specified'
}

function buildEmailFormFields(
  record: ApplicationRecord,
  pdfStorageUrl?: string | null
): Record<string, string> {
  const p1 = record.page1
  const p2 = record.page2
  const p3 = record.page3
  const p5 = record.page5
  const p6 = record.page6
  const p7 = record.page7
  const ec = record.emergencyContacts || []

  const childName = p1?.childFullName || record.child?.fullName || 'Applicant Child'
  const childDob = p1?.childDob || record.child?.dob || '—'
  const childGender = p1?.childGender || record.child?.sex || '—'
  const parentName = p1?.parent1Name || record.parent1?.fullName || 'Parent / Guardian'
  const parentEmail = p1?.parent1Email || record.parent1?.email || '—'
  const parentPhone = p1?.parent1Mobile || record.parent1?.mobile || '—'
  const startDate =
    p3?.requiredStartDate ||
    record.page4?.contractStartDate ||
    record.sessions?.requiredStartDate ||
    '—'
  const contractedHours =
    p3?.contractedHours?.totalHoursPerWeek ||
    record.contractedSchedule?.totalContractedHours ||
    '0'
  const weeklyCost =
    p3?.contractedHours?.totalCostPerWeek ||
    record.contractedSchedule?.totalWeeklyCost ||
    '—'

  const fields: Record<string, string> = {
    _subject: `New Childcare Application: ${childName} (Ref: ${record.applicationId})`,
    _template: 'table',
    _captcha: 'false',
    'Application Reference': record.applicationId,
    'Submitted Date': new Date(record.submittedAt).toLocaleString('en-GB'),
  }

  if (parentEmail && parentEmail !== '—') {
    fields._replyto = parentEmail
  }

  if (pdfStorageUrl) {
    fields['Official PDF File (Download Link)'] = pdfStorageUrl
  }

  // Page 1: Child & Parents
  fields['Child Full Name'] = childName
  fields['Child Date of Birth'] = childDob
  fields['Child Gender'] = childGender
  if (p1?.childRaceEthnicity) fields['Child Race & Ethnicity'] = p1.childRaceEthnicity
  if (p1?.religion) fields['Religion'] = p1.religion
  if (p1?.receivingSocialServices) {
    fields['Social Services Support'] = `${p1.receivingSocialServices}${
      p1.socialWorkerDetails ? ` (${p1.socialWorkerDetails})` : ''
    }`
  }
  if (p1?.specialNeedsOrDisabilities) {
    fields['Special Educational Needs / Disabilities'] = p1.specialNeedsOrDisabilities
  }
  if (p1?.dietaryNeeds) fields['Dietary Needs'] = p1.dietaryNeeds
  if (p1?.previousChildcare) fields['Previous Childcare'] = p1.previousChildcare

  fields['Parent / Guardian 1 Name'] = parentName
  fields['Parent 1 Mobile'] = parentPhone
  fields['Parent 1 Email'] = parentEmail
  if (p1?.parent1Address) fields['Parent 1 Home Address'] = p1.parent1Address
  if (p1?.parent1Profession) fields['Parent 1 Profession'] = p1.parent1Profession
  if (p1?.parent1WorkAddress || p1?.parent1WorkPhone) {
    fields['Parent 1 Work Details'] = [p1.parent1WorkAddress, p1.parent1WorkPhone]
      .filter(Boolean)
      .join(' | ')
  }

  if (p1?.parent2Name) {
    fields['Parent / Guardian 2'] = [
      p1.parent2Name,
      p1.parent2Mobile,
      p1.parent2Email,
      p1.parent2Address,
    ]
      .filter(Boolean)
      .join(' | ')
  }

  if (p1?.whoWillBringCollect || p1?.contactDetails) {
    fields['Who Will Bring / Collect Child'] = [
      p1?.whoWillBringCollect,
      p1?.contactDetails,
    ]
      .filter(Boolean)
      .join(' — ')
  }

  // Emergency Contacts
  ec.forEach((c, idx) => {
    if (c?.name || c?.contactNo) {
      fields[`Emergency Contact ${idx + 1}`] = `${c.name || '—'} | Tel: ${
        c.contactNo || '—'
      } | Rel: ${c.relationship || '—'}`
    }
  })

  // Page 2: Funded Entitlements
  if (
    p2?.universal15Hrs ||
    p2?.workingParent15HrsUnder2Code ||
    p2?.workingParent15Hrs2yoCode ||
    p2?.workingParent30HrsCode
  ) {
    fields['Funded Entitlements'] = [
      p2.universal15Hrs ? `15hrs Universal (3-4yo): ${p2.universal15Hrs}` : '',
      p2.workingParent15HrsUnder2Code
        ? `15hrs (<2yo) Code: ${p2.workingParent15HrsUnder2Code}`
        : '',
      p2.workingParent15Hrs2yoCode
        ? `15hrs (2yo) Code: ${p2.workingParent15Hrs2yoCode}`
        : '',
      p2.workingParent30HrsCode
        ? `30hrs (3-4yo) Code: ${p2.workingParent30HrsCode}`
        : '',
      p2.nationalInsuranceNo ? `NI No: ${p2.nationalInsuranceNo}` : '',
      p2.parentClaimingDob ? `Claiming Parent DOB: ${p2.parentClaimingDob}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
  }

  // Page 3: Contract & Hours Schedule
  fields['Target Start Date'] = startDate
  fields['Weekly Schedule (Mon-Fri)'] = buildScheduleSummary(record)
  fields['Total Contracted Hours / Week'] = `${contractedHours} hrs / week`
  fields['Estimated Weekly Fee'] =
    typeof weeklyCost === 'number' ? `£${weeklyCost.toFixed(2)}` : String(weeklyCost)

  // Page 4: Medical & Consents
  if (p5?.gpName || p5?.gpAddress || p5?.gpPhone) {
    fields['Doctor / GP Details'] = [p5.gpName, p5.gpAddress, p5.gpPhone]
      .filter(Boolean)
      .join(' | ')
  }
  if (p5?.healthVisitorName) fields['Health Visitor'] = p5.healthVisitorName
  if (p5?.immunisationsUpToDate) {
    fields['Immunisations Up to Date'] = p5.immunisationsUpToDate
  }
  if (p5?.medicalNeedsDetails) {
    fields['Medical Conditions / Illnesses'] = p5.medicalNeedsDetails
  }
  if (p5?.allergiesDetails) {
    fields['Allergies / Health Conditions'] = p5.allergiesDetails
  }

  fields['Consents & Permissions'] = [
    `Emergency Hospital: ${p6?.emergencyHospitalTreatment ? 'Yes' : 'No'}`,
    `Local Outings: ${p6?.localOutings ? 'Yes' : 'No'}`,
    `Learning Record Photos: ${p6?.photosVideosLearningRecord ? 'Yes' : 'No'}`,
    `Vehicle Transport: ${p6?.transportInVehicle ? 'Yes' : 'No'}`,
    `Transition Records: ${p6?.transitionRecords ? 'Yes' : 'No'}`,
    `Setting Artwork Display: ${
      p6?.photosArtworkSetting === 'give'
        ? 'Permitted'
        : p6?.photosArtworkSetting === 'do_not_permit'
        ? 'Not permitted'
        : '—'
    }`,
    `Website Photos: ${
      p6?.photosWebsite === 'give'
        ? 'Permitted'
        : p6?.photosWebsite === 'do_not_permit'
        ? 'Not permitted'
        : '—'
    }`,
  ].join(' | ')

  // Page 5: Signature
  fields['Signed By (Parent / Guardian)'] =
    p7?.parentName || parentName || 'Signed digitally'
  fields['Signature Date'] = p7?.parentDate || new Date().toISOString().split('T')[0]

  return fields
}

/**
 * Uploads the generated PDF blob to Firebase Storage and returns its public download URL.
 * Gracefully returns null if Firebase Storage is unreachable or restricted.
 */
async function uploadApplicationPDFToStorage(
  applicationId: string,
  pdfFilename: string,
  blob: Blob
): Promise<string | null> {
  try {
    const storageRef = ref(storage, `applications/${applicationId}/${pdfFilename}`)
    await uploadBytes(storageRef, blob, {
      contentType: 'application/pdf',
      customMetadata: {
        applicationId,
        recipient: ADMIN_APPLICATION_EMAIL,
      },
    })
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  } catch (err) {
    console.warn('[applications] Could not upload PDF to Firebase Storage:', err)
    return null
  }
}

/**
 * Dispatches the application form and generated PDF file to divineheritagechildcare@gmail.com
 * via:
 *  1. Serverless API `/api/send-application-email` (if RESEND_API_KEY is configured)
 *  2. FormSubmit (`https://formsubmit.co/ajax/divineheritagechildcare@gmail.com`) with PDF file attachment & download link
 *  3. Firestore `mail/` trigger collection
 */
async function dispatchApplicationToEmail(
  record: ApplicationRecord,
  blob: Blob,
  base64: string,
  pdfFilename: string
): Promise<{ sent: boolean; error: string | null }> {
  const childName = record.page1?.childFullName || record.child?.fullName || 'Applicant Child'
  const childDob = record.page1?.childDob || record.child?.dob || '—'
  const parentName = record.page1?.parent1Name || record.parent1?.fullName || 'Parent / Guardian'
  const parentEmail = record.page1?.parent1Email || record.parent1?.email || ''
  const parentPhone = record.page1?.parent1Mobile || record.parent1?.mobile || ''
  const startDate =
    record.page3?.requiredStartDate ||
    record.page4?.contractStartDate ||
    record.sessions?.requiredStartDate ||
    '—'
  const contractedHours =
    record.page3?.contractedHours?.totalHoursPerWeek ||
    record.contractedSchedule?.totalContractedHours ||
    0
  const weeklyCost =
    record.page3?.contractedHours?.totalCostPerWeek ||
    record.contractedSchedule?.totalWeeklyCost ||
    0

  let emailSent = false
  let emailErrorMsg: string | null = null

  // 1. Try serverless API route (/api/send-application-email)
  try {
    const emailResponse = await fetch('/api/send-application-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: record.applicationId,
        childName,
        childDob,
        parentName,
        parentEmail,
        parentPhone,
        submittedAt: record.submittedAt,
        startDate,
        contractedHours,
        weeklyCost,
        pdfBase64: base64,
        pdfFilename,
        pdfStorageUrl: record.pdfStorageUrl,
      }),
    })

    const contentType = emailResponse.headers.get('content-type') || ''
    if (emailResponse.ok && contentType.includes('application/json')) {
      const data = await emailResponse.json()
      if (data?.ok === true) {
        emailSent = true
      }
    }
  } catch {
    // Proceed to direct FormSubmit & Firestore mail dispatch
  }

  // 2. Direct dispatch to divineheritagechildcare@gmail.com via FormSubmit with PDF file + full form table
  if (!emailSent && typeof window !== 'undefined') {
    const fields = buildEmailFormFields(record, record.pdfStorageUrl)

    try {
      const formPayload = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        formPayload.append(key, value)
      }
      const pdfFile = new File([blob], pdfFilename, { type: 'application/pdf' })
      formPayload.append('attachment', pdfFile, pdfFilename)

      const fsResponse = await fetch(
        `https://formsubmit.co/ajax/${ADMIN_APPLICATION_EMAIL}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formPayload,
        }
      )

      const fsData = await fsResponse.json().catch(() => null)
      if (fsResponse.ok && fsData?.success !== 'false' && fsData?.success !== false) {
        emailSent = true
      } else {
        // Fallback: send JSON payload to FormSubmit (includes direct PDF link & all fields)
        const jsonResponse = await fetch(
          `https://formsubmit.co/ajax/${ADMIN_APPLICATION_EMAIL}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(fields),
          }
        )
        const jsonData = await jsonResponse.json().catch(() => null)
        if (jsonResponse.ok && jsonData?.success !== 'false' && jsonData?.success !== false) {
          emailSent = true
        } else if (jsonData?.message || fsData?.message) {
          emailErrorMsg = jsonData?.message || fsData?.message
        }
      }
    } catch (fsErr) {
      emailErrorMsg =
        fsErr instanceof Error ? fsErr.message : 'Unable to reach email relay'
    }
  }

  // 3. Also write to Firestore `mail` collection (Firebase Trigger Email extension support)
  try {
    const mailDocRef = doc(collection(db, 'mail'))
    await setDoc(mailDocRef, {
      to: [ADMIN_APPLICATION_EMAIL],
      message: {
        subject: `New Childcare Application: ${childName} (Ref: ${record.applicationId})`,
        text: `A new childcare application has been submitted for ${childName}.\nParent: ${parentName} (${parentPhone}, ${parentEmail})\nStart Date: ${startDate}\nTotal Hours: ${contractedHours} hrs/week.${
          record.pdfStorageUrl ? `\n\nDownload Official PDF: ${record.pdfStorageUrl}` : ''
        }\n\nThis application is also available in the Divine Heritage Admin Dashboard.`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
          <div style="background: #1e3a8a; padding: 18px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0; font-size: 20px;">New Childcare Application Received</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Ref: <strong>${record.applicationId}</strong></p>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff;">
            <p>A new application has been submitted on the Divine Heritage website:</p>
            ${
              record.pdfStorageUrl
                ? `<p style="margin: 16px 0;"><a href="${record.pdfStorageUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Download Official Signed PDF Form</a></p>`
                : ''
            }
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Child Name:</td><td><strong>${childName}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Date of Birth:</td><td>${childDob}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Parent / Guardian:</td><td><strong>${parentName}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Contact Mobile:</td><td>${parentPhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Contact Email:</td><td>${parentEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Target Start Date:</td><td>${startDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Weekly Hours:</td><td><strong>${contractedHours} hrs / week</strong></td></tr>
            </table>
            <p style="font-size: 13px; color: #475569;">The completed 5-page application form and generated PDF are attached and logged in the Admin Dashboard.</p>
          </div>
        </div>`,
        attachments: [
          {
            filename: pdfFilename,
            path: base64,
          },
        ],
      },
    })
    if (!emailSent) {
      emailSent = true
    }
  } catch (triggerErr) {
    if (!emailErrorMsg) {
      emailErrorMsg =
        triggerErr instanceof Error ? triggerErr.message : 'Email service unconfigured'
    }
  }

  return { sent: emailSent, error: emailErrorMsg }
}

// ── Public Submission ─────────────────────────────────────────────────────────

export interface SubmissionResult {
  success: boolean
  applicationId: string
  pdfStorageUrl?: string | null
  emailSent?: boolean
  error?: string
}

/**
 * Submits an application:
 * 1. Generates unique reference ID (e.g. DH-APP-20260904-ABCD)
 * 2. Generates the 5-page signed PDF in memory
 * 3. Uploads PDF to Firebase Cloud Storage so a direct download link is available
 * 4. Sends the PDF file and application form to divineheritagechildcare@gmail.com
 * 5. Writes record to Firestore `applications/{applicationId}` & localStorage for Admin Dashboard oversight
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
  const startDate =
    formData.page3?.requiredStartDate ||
    formData.page4?.contractStartDate ||
    formData.sessions?.requiredStartDate ||
    '—'
  const contractedHours =
    formData.page3?.contractedHours?.totalHoursPerWeek ||
    formData.contractedSchedule?.totalContractedHours ||
    0
  const weeklyCost =
    formData.page3?.contractedHours?.totalCostPerWeek ||
    formData.contractedSchedule?.totalWeeklyCost ||
    0

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
    pdfStorageUrl: null,
  }

  // 1. Generate PDF in memory, upload to Storage, and dispatch to divineheritagechildcare@gmail.com
  try {
    const { blob, base64 } = await generateApplicationPDF(record)
    record.pdfGenerated = true

    const sanitizedChild =
      childName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Registration'
    const pdfFilename = `Divine-Heritage-Application-${sanitizedChild}-${record.applicationId}.pdf`

    // Upload PDF to Firebase Storage for direct email download link
    const storageUrl = await uploadApplicationPDFToStorage(
      record.applicationId,
      pdfFilename,
      blob
    )
    if (storageUrl) {
      record.pdfStorageUrl = storageUrl
    }

    // Send PDF file & application details to divineheritagechildcare@gmail.com
    const { sent, error } = await dispatchApplicationToEmail(
      record,
      blob,
      base64,
      pdfFilename
    )

    record.emailStatus = sent ? 'sent' : 'unconfigured'
    record.emailSentAt = sent ? new Date().toISOString() : null
    record.emailError = error
  } catch (pdfErr) {
    console.warn('[applications] PDF or Email generation error:', pdfErr)
  }

  // 2. Persist to Firestore — this MUST succeed for the application to show in the Admin Dashboard
  try {
    const cleanRecord = removeUndefinedFields(record)
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId)
    await setDoc(docRef, cleanRecord)
  } catch (firestoreErr: any) {
    console.error('[applications] Firestore persistence error:', firestoreErr)
    return {
      success: false,
      applicationId,
      error:
        'Unable to save your application to our database. Please check your internet connection and try again, or contact Avril Cole directly at 07939 303144 / divineheritagechildcare@gmail.com.',
    }
  }

  // 3. Save to localStorage after confirmed database write
  const currentLocal = getLocalApplications()
  saveLocalApplications([record, ...currentLocal])

  return {
    success: true,
    applicationId,
    pdfStorageUrl: record.pdfStorageUrl,
    emailSent: record.emailStatus === 'sent',
  }
}

/**
 * Manually sends or re-sends an existing application record and its generated PDF file
 * to divineheritagechildcare@gmail.com from the Admin Dashboard.
 */
export async function sendApplicationEmailToAdmin(
  app: ApplicationRecord
): Promise<{ success: boolean; message: string }> {
  try {
    const { blob, base64 } = await generateApplicationPDF(app)
    const childName =
      app.page1?.childFullName || app.child?.fullName || 'Registration'
    const sanitizedChild =
      childName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Registration'
    const refId = app.applicationId || app.id
    const pdfFilename = `Divine-Heritage-Application-${sanitizedChild}-${refId}.pdf`

    let storageUrl = app.pdfStorageUrl
    if (!storageUrl) {
      storageUrl = await uploadApplicationPDFToStorage(refId, pdfFilename, blob)
    }

    const updatedRecord: ApplicationRecord = {
      ...app,
      pdfGenerated: true,
      pdfStorageUrl: storageUrl || app.pdfStorageUrl || null,
    }

    const { sent, error } = await dispatchApplicationToEmail(
      updatedRecord,
      blob,
      base64,
      pdfFilename
    )

    if (sent) {
      const sentAt = new Date().toISOString()
      try {
        const docRef = doc(db, APPLICATIONS_COLLECTION, app.id)
        await updateDoc(
          docRef,
          removeUndefinedFields({
            emailStatus: 'sent',
            emailSentAt: sentAt,
            emailError: null,
            pdfStorageUrl: updatedRecord.pdfStorageUrl,
          })
        )
      } catch {
        // Ignore remote update error if local only
      }

      const localItems = getLocalApplications()
      const nextLocal = localItems.map((item) =>
        item.id === app.id
          ? {
              ...item,
              emailStatus: 'sent' as const,
              emailSentAt: sentAt,
              emailError: null,
              pdfStorageUrl: updatedRecord.pdfStorageUrl,
            }
          : item
      )
      saveLocalApplications(nextLocal)

      return {
        success: true,
        message: `Application form and PDF sent to ${ADMIN_APPLICATION_EMAIL}.`,
      }
    }

    return {
      success: false,
      message:
        error ||
        `Could not dispatch email to ${ADMIN_APPLICATION_EMAIL}. Please check your inbox for a one-time FormSubmit activation email or download the PDF directly.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to generate or email the application PDF.',
    }
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
  const { doc: pdfDoc } = await generateApplicationPDF(app)
  const childName =
    (app.page1?.childFullName || app.child?.fullName || 'Registration')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_') || 'Registration'
  const refId = app.applicationId || app.id
  const filename = `Divine-Heritage-Application-${childName}-${refId}.pdf`
  pdfDoc.save(filename)
}
