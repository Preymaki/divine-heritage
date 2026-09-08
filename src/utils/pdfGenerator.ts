/**
 * Divine Heritage Application PDF Generator
 *
 * Clean, authentic document style (clean fonts, bold underlined headers, crisp bordered tables,
 * vector-drawn checkboxes, exact column and text alignment) strictly synchronized with the
 * 5-step application form on the website.
 *
 * Excludes outdated drafts, removed policies, or external bank details.
 */

import { jsPDF } from 'jspdf'
import type { ApplicationRecord } from '@appTypes/application'

const COLOR_BLACK: [number, number, number] = [0, 0, 0]

/**
 * Preloads the website logo for centered rendering on each page.
 */
async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 200
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(img.src)
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve('/logo.png')
      }
    }
    img.onerror = () => resolve(null)
    img.src = '/logo.png'
  })
}

function cleanVal(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  const lower = trimmed.toLowerCase()
  if (
    lower === 'gf' ||
    lower === 'jhv' ||
    lower === 'hgchg' ||
    lower === 'test' ||
    lower === 'asdf' ||
    lower === 'undefined' ||
    lower === 'null' ||
    lower === 'n/a'
  ) {
    return ''
  }
  return trimmed
}

function formatDate(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (!trimmed) return ''
  const parts = trimmed.split('-')
  if (parts.length === 3 && parts[0].length <= 4) {
    const [y, m, d] = parts
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }
  return trimmed
}

/**
 * Draws a crisp vector square checkbox with an optional clean checkmark.
 * Eliminates character-encoding glitches (e.g. '%' or '%i') in jsPDF.
 */
function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  checked: boolean,
  size = 3.2,
) {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.25)
  // Baseline-aligned square box
  doc.rect(x, y - size + 0.5, size, size)
  if (checked) {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.line(x + 0.6, y - size * 0.45, x + size * 0.42, y - 0.6)
    doc.line(x + size * 0.42, y - 0.6, x + size - 0.5, y - size + 0.9)
  }
}

/**
 * Draws a clean centered checkmark inside a table cell.
 */
function drawTableCheckmark(doc: jsPDF, centerX: number, centerY: number) {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.45)
  doc.line(centerX - 1.8, centerY + 0.2, centerX - 0.5, centerY + 1.8)
  doc.line(centerX - 0.5, centerY + 1.8, centerX + 2.2, centerY - 2.0)
}

export async function generateApplicationPDF(
  app: Partial<ApplicationRecord> = {},
): Promise<{ doc: jsPDF; blob: Blob; base64: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const logoDataUrl = await loadLogoDataUrl()
  const margin = 14
  const pageWidth = 210
  const contentWidth = pageWidth - margin * 2 // 182mm
  const totalPages = 5

  // Data bindings directly from website application state
  const p1 = app.page1 || ({} as NonNullable<typeof app.page1>)
  const p2 = app.page2 || ({} as NonNullable<typeof app.page2>)
  const p3 = app.page3 || ({} as NonNullable<typeof app.page3>)
  const p4 = app.page4 || ({} as NonNullable<typeof app.page4>)
  const p5 = app.page5 || ({} as NonNullable<typeof app.page5>)
  const p6 = app.page6 || ({} as NonNullable<typeof app.page6>)
  const p7 = app.page7 || ({} as NonNullable<typeof app.page7>)
  const contacts = app.emergencyContacts || []

  const childName = cleanVal(p1.childFullName || app.child?.fullName)
  const childDob = cleanVal(p1.childDob || app.child?.dob)
  const childGender = cleanVal(p1.childGender || app.child?.sex)
  const childEthnicity = cleanVal(p1.childRaceEthnicity || p4.childRaceEthnicity)
  const religion = cleanVal(p1.religion || p4.religion)
  const receivingSocial = p1.receivingSocialServices || (p5.childInCareOrLookedAfter as string) || ''
  const socialWorker = cleanVal(p1.socialWorkerDetails || p5.lookedAfterDetails)
  const specialNeeds = cleanVal(p1.specialNeedsOrDisabilities)
  const dietaryNeeds = cleanVal(p1.dietaryNeeds || p5.specialDietaryRequirements)
  const previousChildcare = cleanVal(p1.previousChildcare || p4.previousChildcare)

  const parent1Name = cleanVal(p1.parent1Name || app.parent1?.fullName)
  const parent1Address = cleanVal(p1.parent1Address || app.parent1?.homeAddress)
  const parent1Mobile = cleanVal(p1.parent1Mobile || app.parent1?.mobile)
  const parent1Email = cleanVal(p1.parent1Email || app.parent1?.email)
  const parent1Profession = cleanVal(p1.parent1Profession)
  const parent1WorkAddress = cleanVal(p1.parent1WorkAddress)
  const parent1WorkPhone = cleanVal(p1.parent1WorkPhone)

  const parent2Name = cleanVal(p1.parent2Name)
  const parent2Address = cleanVal(p1.parent2Address)
  const parent2Mobile = cleanVal(p1.parent2Mobile)
  const parent2Email = cleanVal(p1.parent2Email)
  const parent2Profession = cleanVal(p1.parent2Profession)
  const parent2WorkAddress = cleanVal(p1.parent2WorkAddress)
  const parent2WorkPhone = cleanVal(p1.parent2WorkPhone)

  const whoWillBringCollect = cleanVal(p1.whoWillBringCollect)
  const contactDetails = cleanVal(p1.contactDetails)

  function renderPageHeader(pageNum: number) {
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 95, 8, 20, 20)
      } catch {
        // fallback
      }
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_BLACK)
    doc.text(`Page ${pageNum} of ${totalPages}`, margin, 287)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: Child Details, Parents & Emergency Contact 1
  // ═══════════════════════════════════════════════════════════════════════════
  renderPageHeader(1)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('DIVINE HERITAGE APPLICATION FORM', 105, 33, { align: 'center' })

  // Section Header
  let y = 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const h1 = 'Details of Parental responsibility, legal contact, & residence arrangements:'
  doc.text(h1, margin, y)
  doc.setLineWidth(0.3)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(h1), y + 0.8)

  y += 3.5

  // 2-Column Table Layout exactly matching the official form
  const colW = 91 // 182 / 2
  const rowHeights = [12, 10.5, 11.5, 12, 11.5, 10.5, 16, 18, 18, 11, 10]
  const tableH = rowHeights.reduce((a, b) => a + b, 0)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.rect(margin, y, contentWidth, tableH)

  // Vertical center line for rows 0, 1, 2, 4, 5, 6, 7, 8
  const colSplitRows = [0, 1, 2, 4, 5, 6, 7, 8]
  let curY = y
  for (let r = 0; r < rowHeights.length; r++) {
    if (r > 0) {
      doc.line(margin, curY, margin + contentWidth, curY)
    }
    if (colSplitRows.includes(r)) {
      doc.line(margin + colW, curY, margin + colW, curY + rowHeights[r])
    }
    curY += rowHeights[r]
  }

  let rY = y

  // Row 0: Full name of Child | Date of Birth & Gender
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Full name of Child:', margin + 2, rY + 4.2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  if (childName) doc.text(childName, margin + 2, rY + 9.0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Date of Birth:', margin + colW + 2, rY + 4.2)
  doc.setFont('helvetica', 'normal')
  if (childDob) doc.text(formatDate(childDob), margin + colW + 22, rY + 4.2)

  const isMale = childGender.toLowerCase() === 'male'
  const isFemale = childGender.toLowerCase() === 'female'
  doc.setFont('helvetica', 'bold')
  doc.text('Gender:', margin + colW + 2, rY + 9.0)
  doc.setFont('helvetica', 'normal')
  doc.text('Male', margin + colW + 15, rY + 9.0)
  drawCheckbox(doc, margin + colW + 23, rY + 9.0, isMale)
  doc.text('Female', margin + colW + 32, rY + 9.0)
  drawCheckbox(doc, margin + colW + 43, rY + 9.0, isFemale)

  rY += rowHeights[0]

  // Row 1: Race & Ethnic Background | Religion
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text("Child's Race & Ethnic background:", margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (childEthnicity) doc.text(childEthnicity, margin + 2, rY + 8.2)

  doc.setFont('helvetica', 'bold')
  doc.text('Religion:', margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (religion) doc.text(religion, margin + colW + 2, rY + 8.2)

  rY += rowHeights[1]

  // Row 2: Social Services - cleanly separated into 2 columns
  const socYes = receivingSocial.toLowerCase() === 'yes'
  const socNo = receivingSocial.toLowerCase() === 'no'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('Receiving support from social services?', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Yes', margin + 2, rY + 8.5)
  drawCheckbox(doc, margin + 9, rY + 8.5, socYes)
  doc.text('No', margin + 17, rY + 8.5)
  drawCheckbox(doc, margin + 23, rY + 8.5, socNo)

  doc.setFont('helvetica', 'bold')
  doc.text('Social worker / team:', margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (socialWorker) {
    doc.text(doc.splitTextToSize(socialWorker, colW - 4), margin + colW + 2, rY + 8.5)
  }

  rY += rowHeights[2]

  // Row 3: Special Educational Needs or Disabilities (Full Width)
  doc.setFont('helvetica', 'bold')
  doc.text('Special Educational needs or Disabilities:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (specialNeeds) {
    doc.text(doc.splitTextToSize(specialNeeds, contentWidth - 4), margin + 2, rY + 8.5)
  }

  rY += rowHeights[3]

  // Row 4: Dietary Needs | Previous Childcare
  doc.setFont('helvetica', 'bold')
  doc.text('Dietary needs for food or drinks:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (dietaryNeeds) {
    doc.text(doc.splitTextToSize(dietaryNeeds, colW - 4), margin + 2, rY + 8.5)
  }

  doc.setFont('helvetica', 'bold')
  doc.text("Child's Previous Childcare:", margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (previousChildcare) {
    doc.text(doc.splitTextToSize(previousChildcare, colW - 4), margin + colW + 2, rY + 8.5)
  }

  rY += rowHeights[4]

  // Row 5: Parent 1 Name | Parent 2 Name
  doc.setFont('helvetica', 'bold')
  doc.text('Name of Parent/ Carer/ Guardian 1:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent1Name) doc.text(parent1Name, margin + 2, rY + 8.2)

  doc.setFont('helvetica', 'bold')
  doc.text('Name of Parent/ Carer/ Guardian 2:', margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent2Name) doc.text(parent2Name, margin + colW + 2, rY + 8.2)

  rY += rowHeights[5]

  // Row 6: Home Addresses
  doc.setFont('helvetica', 'bold')
  doc.text('Home Address:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent1Address) {
    doc.text(doc.splitTextToSize(parent1Address, colW - 4), margin + 2, rY + 8.2)
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Home Address:', margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent2Address) {
    doc.text(doc.splitTextToSize(parent2Address, colW - 4), margin + colW + 2, rY + 8.2)
  }

  rY += rowHeights[6]

  // Row 7: Phone Mobile, Email, Profession
  doc.setFont('helvetica', 'bold')
  doc.text('Phone Mobile:', margin + 2, rY + 4.2)
  doc.setFont('helvetica', 'normal')
  if (parent1Mobile) doc.text(parent1Mobile, margin + 24, rY + 4.2)

  doc.setFont('helvetica', 'bold')
  doc.text('Email:', margin + 2, rY + 9.5)
  doc.setFont('helvetica', 'normal')
  if (parent1Email) doc.text(parent1Email, margin + 13, rY + 9.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Profession:', margin + 2, rY + 14.8)
  doc.setFont('helvetica', 'normal')
  if (parent1Profession) doc.text(parent1Profession, margin + 20, rY + 14.8)

  // Col 2
  doc.setFont('helvetica', 'bold')
  doc.text('Phone Mobile:', margin + colW + 2, rY + 4.2)
  doc.setFont('helvetica', 'normal')
  if (parent2Mobile) doc.text(parent2Mobile, margin + colW + 24, rY + 4.2)

  doc.setFont('helvetica', 'bold')
  doc.text('Email:', margin + colW + 2, rY + 9.5)
  doc.setFont('helvetica', 'normal')
  if (parent2Email) doc.text(parent2Email, margin + colW + 13, rY + 9.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Profession:', margin + colW + 2, rY + 14.8)
  doc.setFont('helvetica', 'normal')
  if (parent2Profession) doc.text(parent2Profession, margin + colW + 20, rY + 14.8)

  rY += rowHeights[7]

  // Row 8: Work / College Address & Work Phone
  doc.setFont('helvetica', 'bold')
  doc.text('Work / College Address:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent1WorkAddress) {
    doc.text(doc.splitTextToSize(parent1WorkAddress, colW - 4), margin + 2, rY + 8.0)
  }
  doc.setFont('helvetica', 'bold')
  doc.text('Work Phone:', margin + 2, rY + 14.5)
  doc.setFont('helvetica', 'normal')
  if (parent1WorkPhone) doc.text(parent1WorkPhone, margin + 22, rY + 14.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Work / College Address:', margin + colW + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (parent2WorkAddress) {
    doc.text(doc.splitTextToSize(parent2WorkAddress, colW - 4), margin + colW + 2, rY + 8.0)
  }
  doc.setFont('helvetica', 'bold')
  doc.text('Work Phone:', margin + colW + 2, rY + 14.5)
  doc.setFont('helvetica', 'normal')
  if (parent2WorkPhone) doc.text(parent2WorkPhone, margin + colW + 22, rY + 14.5)

  rY += rowHeights[8]

  // Row 9: Who will bring/collect
  doc.setFont('helvetica', 'bold')
  doc.text('Who will bring/collect the child from the childminder:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (whoWillBringCollect) doc.text(whoWillBringCollect, margin + 2, rY + 8.2)

  rY += rowHeights[9]

  // Row 10: Contact Details
  doc.setFont('helvetica', 'bold')
  doc.text('Contact Details:', margin + 2, rY + 4.0)
  doc.setFont('helvetica', 'normal')
  if (contactDetails) doc.text(contactDetails, margin + 2, rY + 7.8)

  y += tableH + 6.5

  // Emergency Contact 1 Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(
    'Emergency Contact(s) - Please note that completing this task is mandatory, and all tasks',
    margin,
    y,
  )
  doc.text('must be finished.', margin, y + 4.0)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Contact 1 of 4 (continued on Page 2)', margin, y + 8.5)

  y += 11.0

  const ecW = [60, 60, 62] // 182mm
  doc.setLineWidth(0.3)
  doc.rect(margin, y, contentWidth, 15)
  doc.line(margin, y + 6, margin + contentWidth, y + 6)
  doc.line(margin + ecW[0], y, margin + ecW[0], y + 15)
  doc.line(margin + ecW[0] + ecW[1], y, margin + ecW[0] + ecW[1], y + 15)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Name:', margin + 2, y + 4.2)
  doc.text('Contact no', margin + ecW[0] + 2, y + 4.2)
  doc.text('Relationship', margin + ecW[0] + ecW[1] + 2, y + 4.2)

  const c1 = contacts[0]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(`1.  ${cleanVal(c1?.name) || ''}`, margin + 2, y + 11.0)
  doc.text(cleanVal(c1?.contactNo) || '', margin + ecW[0] + 2, y + 11.0)
  doc.text(cleanVal(c1?.relationship) || '', margin + ecW[0] + ecW[1] + 2, y + 11.0)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: Emergency Contacts (2-4), Funded Entitlements & Fees
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(2)
  y = 34

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  const h2 = 'Emergency Contact(s) (Continued)'
  doc.text(h2, margin, y)
  doc.setLineWidth(0.3)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(h2), y + 0.8)

  y += 5.5

  // Table for Contacts 2, 3, 4
  doc.rect(margin, y, contentWidth, 30)
  doc.line(margin, y + 6, margin + contentWidth, y + 6)
  doc.line(margin, y + 14, margin + contentWidth, y + 14)
  doc.line(margin, y + 22, margin + contentWidth, y + 22)
  doc.line(margin + ecW[0], y, margin + ecW[0], y + 30)
  doc.line(margin + ecW[0] + ecW[1], y, margin + ecW[0] + ecW[1], y + 30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Name:', margin + 2, y + 4.2)
  doc.text('Contact no', margin + ecW[0] + 2, y + 4.2)
  doc.text('Relationship', margin + ecW[0] + ecW[1] + 2, y + 4.2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  for (let i = 1; i <= 3; i++) {
    const c = contacts[i]
    const rowYPos = y + 6 + (i - 1) * 8
    doc.text(`${i + 1}.  ${cleanVal(c?.name) || ''}`, margin + 2, rowYPos + 5.5)
    doc.text(cleanVal(c?.contactNo) || '', margin + ecW[0] + 2, rowYPos + 5.5)
    doc.text(cleanVal(c?.relationship) || '', margin + ecW[0] + ecW[1] + 2, rowYPos + 5.5)
  }

  y += 37

  // Funded Hours / Free Entitlements
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hFh = 'Funded Hours / Free Entitlements'
  doc.text(hFh, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hFh), y + 0.8)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const fhP1 =
    'All children aged 3 years old are eligible for the universal 15-hour entitlement from the term after their third birthday. Each eligible child is entitled to a maximum of 15 hours per week over no fewer than 38 weeks per year, during term-time only.'
  doc.text(doc.splitTextToSize(fhP1, contentWidth), margin, y)
  y += 10.5

  const fhP2 =
    'Only children aged 9 months to 2 years are eligible to take up a free entitlement place. Eligible parents must provide a copy of their confirmation code to obtain a free space.'
  doc.text(doc.splitTextToSize(fhP2, contentWidth), margin, y)
  y += 10.0

  doc.setFont('helvetica', 'bold')
  doc.text('Which of the free entitlements are you claiming for this child?', margin, y)
  y += 6.0

  doc.setFont('helvetica', 'normal')
  const hasUniv = p2.universal15Hrs === 'Yes'
  const notUniv = p2.universal15Hrs === 'No'
  doc.text('•  15hrs universal entitlement for 3 & 4-year-olds?', margin + 2, y)
  doc.text('Yes', margin + 84, y)
  drawCheckbox(doc, margin + 91, y, hasUniv)
  doc.text('No', margin + 101, y)
  drawCheckbox(doc, margin + 107, y, notUniv)
  y += 6.5

  const code923 = cleanVal(p2.workingParent15HrsUnder2Code)
  doc.text('•  15hrs working parent entitlement (9-23 months old) Code:', margin + 2, y)
  doc.text(code923 || '________________________________________', margin + 92, y)
  y += 6.5

  const code2yo = cleanVal(p2.workingParent15Hrs2yoCode)
  doc.text('•  15hrs working parent Entitlement (2 years old) Code:', margin + 2, y)
  doc.text(code2yo || '________________________________________', margin + 86, y)
  y += 6.5

  const code30h = cleanVal(p2.workingParent30HrsCode)
  doc.text('•  30 hrs working parent entitlement (3 & 4-year-old) code:', margin + 2, y)
  doc.text(code30h || '________________________________________', margin + 89, y)
  y += 7.5

  const niNo = cleanVal(p2.nationalInsuranceNo)
  doc.setFont('helvetica', 'bold')
  doc.text('National Insurance no for parent claiming funded hours:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(niNo || '__________________________________', margin + 83, y)
  y += 6.5

  const claimDob = cleanVal(p2.parentClaimingDob)
  doc.setFont('helvetica', 'bold')
  doc.text('Parent claiming funded hours DOB:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(claimDob) || '__________________________________________', margin + 55, y)
  y += 8.0

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  const fhP3 =
    'Parents must reapply for the 30-hour funding term, as this is not an automatic enrolment. The 30-hour funding can be used up to 10 hours per day.'
  doc.text(doc.splitTextToSize(fhP3, contentWidth), margin, y)
  y += 8.5

  const fhP4 =
    'A separate fee is required from parents for children accessing 15/30 hours of free childcare for any hours beyond their weekly entitlement.'
  doc.text(doc.splitTextToSize(fhP4, contentWidth), margin, y)
  y += 11.5

  // Fees Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hFees = 'Fees:'
  doc.text(hFees, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hFees), y + 0.8)

  y += 5.5
  doc.rect(margin, y, contentWidth, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('Rate: Hourly - £12.00          Day rate: £70.00          Full-time £330.00 per week', margin + 3, y + 6.0)
  doc.text('Ad hoc fees: £18.00 payable on booking.', margin + 3, y + 12.5)
  doc.text('Babies under 8 months: - £80.00 per day          Hourly – £14.00', margin + 3, y + 19.0)
  doc.text('School pickups: - 3 pm – 6 pm - £30.00 per day', margin + 3, y + 25.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Flexible Hours: Minimum 3 hrs & above.', margin + 3, y + 32.0)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3: Sessions & Hours Schedules (Strictly from Website Form)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(3)
  y = 34

  // Website Payment Note (No external bank details)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const p3Notice =
    'Fees are payable in advance on a weekly, 4-weekly, or monthly basis. Fees can be paid by cash, tax-free childcare voucher, Universal Credit, or online bank transfer.'
  doc.text(doc.splitTextToSize(p3Notice, contentWidth), margin, y)
  y += 10.5

  // Start of contract
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hSoc = 'Start of contract'
  doc.text(hSoc, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hSoc), y + 0.8)

  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Full Day: 8-6 pm          Friday closes at 5 PM', margin, y)
  y += 5.5

  const startDate = cleanVal(p3.requiredStartDate || p4.contractStartDate)
  doc.text('Start of contract:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(startDate) || '____________________________________', margin + 28, y)
  y += 5.5

  doc.setFont('helvetica', 'bold')
  doc.text('A minimum of four weeks’ notice is required to end the contract.', margin, y)
  y += 8.5

  // Early Years Funded Hours Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Early Years Funded Hours', margin, y)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Only complete if you’re entitled to funded hours.', margin + 48, y)
  y += 4.5

  const fColW = [47, 22.5, 22.5, 22.5, 22.5, 22.5, 22.5] // 182mm
  doc.setLineWidth(0.3)
  doc.rect(margin, y, contentWidth, 28)
  doc.line(margin, y + 7, margin + contentWidth, y + 7)
  doc.line(margin, y + 14, margin + contentWidth, y + 14)
  doc.line(margin, y + 21, margin + contentWidth, y + 21)

  let curX = margin
  for (let i = 0; i < fColW.length - 1; i++) {
    curX += fColW[i]
    doc.line(curX, y, curX, y + 28)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Time', margin + 2, y + 4.8)
  curX = margin + fColW[0]
  doc.text('Monday', curX + 5, y + 4.8)
  curX += fColW[1]
  doc.text('Tuesday', curX + 5, y + 4.8)
  curX += fColW[2]
  doc.text('Wednesday', curX + 3, y + 4.8)
  curX += fColW[3]
  doc.text('Thursday', curX + 5, y + 4.8)
  curX += fColW[4]
  doc.text('Friday', curX + 6, y + 4.8)
  curX += fColW[5]
  doc.text('Total Hrs', curX + 5, y + 4.8)

  const fs = p3.fundedSchedule
  const fRows = [
    { label: '8 – 1pm (5 hrs/day)', data: fs?.row8to1 },
    { label: '12 - 12:45 - 5 - 5:45 PM (5 hrs/day)', data: fs?.row12to5 },
    { label: 'Full Day 8-6 pm', data: fs?.rowFullDay },
  ]

  doc.setFont('helvetica', 'normal')
  for (let r = 0; r < fRows.length; r++) {
    const rowYPos = y + 7 + r * 7
    doc.text(fRows[r].label, margin + 2, rowYPos + 4.8)

    const rowData = fRows[r].data
    curX = margin + fColW[0]
    if (rowData?.monday) drawTableCheckmark(doc, curX + 11.25, rowYPos + 3.2)
    curX += fColW[1]
    if (rowData?.tuesday) drawTableCheckmark(doc, curX + 11.25, rowYPos + 3.2)
    curX += fColW[2]
    if (rowData?.wednesday) drawTableCheckmark(doc, curX + 11.25, rowYPos + 3.2)
    curX += fColW[3]
    if (rowData?.thursday) drawTableCheckmark(doc, curX + 11.25, rowYPos + 3.2)
    curX += fColW[4]
    if (rowData?.friday) drawTableCheckmark(doc, curX + 11.25, rowYPos + 3.2)
    curX += fColW[5]
    const totHrs = cleanVal(rowData?.totalHrs)
    if (totHrs) {
      doc.text(totHrs, curX + 11.25, rowYPos + 4.8, { align: 'center' })
    }
  }

  y += 33.0
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(
    'Please note that I only Accept children for a minimum of 2 full days and 3 part time days',
    margin,
    y,
  )

  y += 8.5

  // Contracted Hours Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Contracted Hours', margin, y)
  y += 4.5

  const cColW = [32, 30, 30, 42, 48] // 182mm
  doc.rect(margin, y, contentWidth, 49)
  for (let r = 1; r <= 6; r++) {
    doc.line(margin, y + r * 7, margin + contentWidth, y + r * 7)
  }
  curX = margin
  for (let i = 0; i < cColW.length - 1; i++) {
    curX += cColW[i]
    doc.line(curX, y, curX, y + 49)
  }

  doc.setFontSize(8)
  doc.text('Day', margin + 3, y + 4.8)
  curX = margin + cColW[0]
  doc.text('Time From', curX + 3, y + 4.8)
  curX += cColW[1]
  doc.text('Time To', curX + 3, y + 4.8)
  curX += cColW[2]
  doc.text('Total Hours', curX + 3, y + 4.8)
  curX += cColW[3]
  doc.text('Hourly/weekly Rate £', curX + 3, y + 4.8)

  const cHours = p3.contractedHours
  const cDays = [
    { name: 'Monday', row: cHours?.monday },
    { name: 'Tuesday', row: cHours?.tuesday },
    { name: 'Wednesday', row: cHours?.wednesday },
    { name: 'Thursday', row: cHours?.thursday },
    { name: 'Friday', row: cHours?.friday },
  ]

  doc.setFont('helvetica', 'normal')
  for (let r = 0; r < cDays.length; r++) {
    const rowYPos = y + 7 + r * 7
    doc.text(cDays[r].name, margin + 3, rowYPos + 4.8)

    const d = cDays[r].row
    curX = margin + cColW[0]
    doc.text(cleanVal(d?.timeFrom) || '', curX + 3, rowYPos + 4.8)
    curX += cColW[1]
    doc.text(cleanVal(d?.timeTo) || '', curX + 3, rowYPos + 4.8)
    curX += cColW[2]
    doc.text(cleanVal(d?.totalHours) ? `${d?.totalHours} hrs` : '', curX + 3, rowYPos + 4.8)
    curX += cColW[3]
    doc.text(cleanVal(d?.rate) ? (d?.rate.startsWith('£') ? d?.rate : `£${d?.rate}`) : '', curX + 3, rowYPos + 4.8)
  }

  // Summary Row: Total hours/cost per week
  const sumY = y + 42
  doc.setFont('helvetica', 'bold')
  doc.text('Total hours/cost per week', margin + 3, sumY + 5.0)

  // Column 3: Total Hours Per Week
  curX = margin + cColW[0] + cColW[1] + cColW[2] // margin + 92
  const totWkHrs = cleanVal(cHours?.totalHoursPerWeek)
  doc.text(totWkHrs ? `${totWkHrs} hrs` : '', curX + 3, sumY + 5.0)

  // Column 4: Total Cost Per Week
  curX += cColW[3] // margin + 134
  const totWkCost = cleanVal(cHours?.totalCostPerWeek)
  doc.text(totWkCost ? (totWkCost.startsWith('£') ? totWkCost : `£${totWkCost}`) : '', curX + 3, sumY + 5.0)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4: Medical Information, Consent & Sickness
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(4)
  y = 34

  // Medical Information
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hMed = 'Medical Information'
  doc.text(hMed, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hMed), y + 0.8)

  y += 5.5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text("Doctor's Name:", margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanVal(p5.gpName) || '________________________________________________________', margin + 26, y)
  y += 6.5

  doc.setFont('helvetica', 'bold')
  doc.text('Surgery Name and Address:', margin, y)
  doc.setFont('helvetica', 'normal')
  const surgAddr = cleanVal(p5.gpAddress || p5.gpNameAddress)
  doc.text(surgAddr || '____________________________________________', margin + 46, y)
  y += 6.5

  doc.setFont('helvetica', 'bold')
  doc.text('Phone no:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanVal(p5.gpPhone) || '________________________________________________________', margin + 18, y)
  y += 6.5

  doc.setFont('helvetica', 'bold')
  doc.text('Health visitor name and contact number:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanVal(p5.healthVisitorName) || '____________________________________', margin + 64, y)
  y += 7.0

  const immYes = p5.immunisationsUpToDate === 'Yes'
  const immNo = p5.immunisationsUpToDate === 'No'
  doc.setFont('helvetica', 'bold')
  doc.text('Immunisations: Are they up to date?', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text('Yes', margin + 62, y)
  drawCheckbox(doc, margin + 69, y, immYes)
  doc.text('No', margin + 79, y)
  drawCheckbox(doc, margin + 85, y, immNo)
  y += 7.0

  doc.setFont('helvetica', 'bold')
  doc.text('Dental treatment?', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanVal(p5.dentalTreatment) || '___________________________________________________', margin + 29, y)
  y += 7.5

  doc.setFont('helvetica', 'bold')
  doc.text('Any childhood illnesses/ serious condition? If yes, please give details below.', margin, y)
  y += 2.5
  doc.rect(margin, y, contentWidth, 14)
  const medNeeds = cleanVal(p5.medicalNeedsDetails)
  if (medNeeds) {
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(medNeeds, contentWidth - 4), margin + 2, y + 4.5)
  }
  y += 17.5

  doc.setFont('helvetica', 'bold')
  doc.text(
    'Any Allergies/ health conditions, e.g asthma, eczema, inhaler/ epipen, penicillin, food, plaster, etc',
    margin,
    y,
  )
  y += 2.5
  doc.rect(margin, y, contentWidth, 14)
  const allergies = cleanVal(p5.allergiesDetails || p5.specialDietaryRequirements)
  if (allergies) {
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(allergies, contentWidth - 4), margin + 2, y + 4.5)
  }
  y += 18.5

  // Consent - Please tick to give permission
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hCon = 'Consent - Please tick to give permission'
  doc.text(hCon, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hCon), y + 0.8)

  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Please tick to give permission:', margin, y)
  y += 5.5

  const pEmergency = p6.emergencyHospitalTreatment ?? true
  const pOutings = p6.localOutings ?? true
  const pPhotos = p6.photosVideosLearningRecord ?? true
  const pTransport = p6.transportInVehicle ?? true
  const pTransition = p6.transitionRecords ?? true

  doc.setFont('helvetica', 'normal')
  // Checkbox on left ensures zero overflow or right margin clipping
  drawCheckbox(doc, margin, y, pEmergency)
  doc.text('My child can be taken to the hospital for treatment in the event of an emergency', margin + 6, y)
  y += 6.0

  drawCheckbox(doc, margin, y, pOutings)
  doc.text('My child can be taken on local outing trips', margin + 6, y)
  y += 6.0

  drawCheckbox(doc, margin, y, pPhotos)
  doc.text('My child to have photographs/ videos taken for the learning record', margin + 6, y)
  y += 6.0

  drawCheckbox(doc, margin, y, pTransport)
  doc.text('My child is to be transported by the childminder/setting in the vehicle used for this purpose', margin + 6, y)
  y += 6.0

  drawCheckbox(doc, margin, y, pTransition)
  doc.text('My child’s records were passed on to the next setting as part of transition arrangements', margin + 6, y)
  y += 7.0

  const artGive = p6.photosArtworkSetting === 'give'
  const artNo = p6.photosArtworkSetting === 'do_not_permit'
  doc.setFont('helvetica', 'bold')
  doc.text('Photos/artwork used and displayed within setting:', margin, y)
  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.text('I give permission', margin + 4, y)
  drawCheckbox(doc, margin + 31, y, artGive)
  doc.text('I do not permit', margin + 48, y)
  drawCheckbox(doc, margin + 72, y, artNo)
  y += 6.5

  const webGive = p6.photosWebsite === 'give'
  const webNo = p6.photosWebsite === 'do_not_permit'
  doc.setFont('helvetica', 'bold')
  doc.text('Photos/work included on website:', margin, y)
  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.text('I give permission', margin + 4, y)
  drawCheckbox(doc, margin + 31, y, webGive)
  doc.text('I do not permit', margin + 48, y)
  drawCheckbox(doc, margin + 72, y, webNo)
  y += 8.5

  // Sickness Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hSick = 'Sickness'
  doc.text(hSick, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hSick), y + 0.8)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const sickP1 =
    'Divine Heritage may contact you if your child is unwell (e.g., persistent coughing or sneezing) to prevent spreading illness to other children and staff.'
  doc.text(doc.splitTextToSize(sickP1, contentWidth), margin, y)
  y += 10.0

  const sickP2 =
    'Do not send your child if they were given antibiotics or Calpol before the session.'
  doc.text(doc.splitTextToSize(sickP2, contentWidth), margin, y)
  y += 6.5

  const sickP3 =
    'Vomiting/Diarrhoea: Children must stay home for 48 hours after their last episode and until completely recovered.'
  doc.text(doc.splitTextToSize(sickP3, contentWidth), margin, y)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5: Collection, Declarations & Signatures (Strictly from Website Form)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(5)
  y = 34

  // Collection Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hColl = 'Collection'
  doc.text(hColl, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hColl), y + 0.8)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const cp1 =
    'Full payment is required in advance for all contracted hours. No refunds or discounts are given for early collections, or absences.'
  doc.text(doc.splitTextToSize(cp1, contentWidth), margin, y)
  y += 9.5

  const cp2 =
    'Early drop offs require prior arrangement due to strict staff to child ratio limits.'
  doc.text(doc.splitTextToSize(cp2, contentWidth), margin, y)
  y += 6.5

  const cp3 =
    'Arrive 5 minutes before your scheduled pick up time. Repeated late pick ups constitute a breach of contract.'
  doc.text(doc.splitTextToSize(cp3, contentWidth), margin, y)
  y += 6.5

  doc.setFont('helvetica', 'bold')
  const cp4 = 'A late collection fee will incur a fine of £3.00 per minute.'
  doc.text(cp4, margin, y)
  y += 6.5

  doc.setFont('helvetica', 'normal')
  const cp5 = 'Fines are payable and failure to pay will result in withdrawal of service until payment is made.'
  doc.text(cp5, margin, y)
  y += 6.5

  const cp6 =
    'Call at least 30 minutes in advance (or as soon as possible) if your child will be late or absent.'
  doc.text(doc.splitTextToSize(cp6, contentWidth), margin, y)
  y += 11.0

  // Declarations & Signatures
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const hDec = 'Declarations & Signatures'
  doc.text(hDec, margin, y)
  doc.line(margin, y + 0.8, margin + doc.getTextWidth(hDec), y + 0.8)

  y += 7.5

  // Side-by-side formal signature boxes
  const boxW = 88
  const boxH = 74
  const b1X = margin
  const b2X = margin + 94

  // Box 1: Parent/Guardian
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.rect(b1X, y, boxW, boxH)
  doc.line(b1X, y + 8, b1X + boxW, y + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Parent / Guardian Signature', b1X + 4, y + 5.5)

  if (p7.parentSignature && p7.parentSignature.startsWith('data:image')) {
    try {
      doc.addImage(p7.parentSignature, 'PNG', b1X + 8, y + 11, 55, 14)
    } catch {
      // fallback
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('Signed: ___________________________', b1X + 4, y + 27)

  const pName = cleanVal(p7.parentName) || parent1Name
  doc.setFont('helvetica', 'bold')
  doc.text('Name:', b1X + 4, y + 38)
  doc.setFont('helvetica', 'normal')
  doc.text(pName || '_________________________________', b1X + 16, y + 38)

  const pDate = cleanVal(p7.parentDate)
  doc.setFont('helvetica', 'bold')
  doc.text('Date:', b1X + 4, y + 49)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(pDate) || '__________________________________', b1X + 14, y + 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Parent / Guardian', b1X + 4, y + 62)

  // Box 2: Childminder
  doc.rect(b2X, y, boxW, boxH)
  doc.line(b2X, y + 8, b2X + boxW, y + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Childminder Counter-Signature', b2X + 4, y + 5.5)

  // Script signature for Avril Cole
  doc.setFont('times', 'italic')
  doc.setFontSize(16)
  doc.setTextColor(20, 20, 20)
  doc.text('Avril Cole', b2X + 24, y + 24)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('Signed: ___________________________', b2X + 4, y + 27)

  doc.setFont('helvetica', 'bold')
  doc.text('Name:', b2X + 4, y + 38)
  doc.setFont('helvetica', 'normal')
  doc.text('Avril Cole', b2X + 16, y + 38)

  const cmDate = cleanVal(p7.childminderDate || p7.parentDate)
  doc.setFont('helvetica', 'bold')
  doc.text('Date:', b2X + 4, y + 49)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(cmDate) || '__________________________________', b2X + 14, y + 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Childminder', b2X + 4, y + 62)

  y += boxH + 9

  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(8.5)
  doc.text('Please note that the Parent/Guardian signing above is responsible for paying fees.', margin, y)

  const blob = doc.output('blob')
  const base64 = doc.output('datauristring')

  return { doc, blob, base64 }
}

/**
 * Downloads the completed application PDF with the child's name and reference in the filename.
 */
export async function downloadApplicationPDF(app: Partial<ApplicationRecord> = {}): Promise<void> {
  const { doc } = await generateApplicationPDF(app)
  const childName = cleanVal(app.page1?.childFullName || app.child?.fullName) || 'Registration'
  const sanitized = childName.replace(/[^a-zA-Z0-9]/g, '_')
  const ref = app.applicationId || app.id || 'DH'
  doc.save(`Divine-Heritage-Application-${sanitized}-${ref}.pdf`)
}

/**
 * Downloads a blank application template matching the website application form.
 */
export async function downloadBlankApplicationPDF(): Promise<void> {
  const { doc } = await generateApplicationPDF({})
  doc.save('Divine-Heritage-Childcare-Application-Form.pdf')
}
