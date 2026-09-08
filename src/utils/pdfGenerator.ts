/**
 * Divine Heritage Application PDF Generator
 *
 * Faithfully generates an official multi-page PDF document representing
 * the exact 7 pages of the Divine Heritage Childcare Application Form.
 */

import { jsPDF } from 'jspdf'
import type { ApplicationRecord } from '@appTypes/application'
import {
  calculateWeeklySchedule,
  calculateFundedHours,
  isChildUnder8Months,
} from './applicationFees'

const PRIMARY_COLOR: [number, number, number] = [30, 58, 138] // #1e3a8a Navy
const TEXT_DARK: [number, number, number] = [30, 41, 59] // #1e293b Slate 800
const TEXT_MUTED: [number, number, number] = [100, 116, 139] // #64748b Slate 500
const BORDER_COLOR: [number, number, number] = [200, 205, 215] // light border
const BG_HEADER: [number, number, number] = [241, 245, 249] // #f1f5f9 Slate 100

export async function generateApplicationPDF(
  app: ApplicationRecord,
): Promise<{ doc: jsPDF; blob: Blob; base64: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  let currentY = margin

  function renderPageHeader(pageNumber: number) {
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(margin, 10, contentWidth, 1.2, 'F')

    doc.setFontSize(8)
    doc.setTextColor(...TEXT_MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text('DIVINE HERITAGE CHILDCARE SERVICE — APPLICATION FORM', margin, 15)
    doc.text(`Ref: ${app.applicationId || app.id}`, pageWidth - margin, 15, { align: 'right' })

    doc.setFontSize(8)
    doc.text(`Page ${pageNumber} of 6`, margin, pageHeight - 8)
  }

  function renderSectionHeader(title: string) {
    doc.setFillColor(...BG_HEADER)
    doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, 'F')
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(margin, currentY, 2.5, 7, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(title, margin + 4, currentY + 4.8)
    currentY += 9
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════════════════════════════════
  renderPageHeader(1)
  currentY = 20

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('DIVINE HERITAGE APPLICATION FORM', pageWidth / 2, currentY, { align: 'center' })
  currentY += 6

  // Childminder Details Box
  doc.setDrawColor(...BORDER_COLOR)
  doc.setLineWidth(0.3)
  doc.rect(margin, currentY, contentWidth, 22)

  doc.setFontSize(8.5)
  doc.setTextColor(...TEXT_DARK)
  doc.setFont('helvetica', 'bold')
  doc.text('Name of Childminder:', margin + 3, currentY + 5)
  doc.setFont('helvetica', 'normal')
  doc.text('Avril Cole', margin + 35, currentY + 5)

  doc.setFont('helvetica', 'bold')
  doc.text('Address:', margin + 95, currentY + 5)
  doc.setFont('helvetica', 'normal')
  doc.text('5 Pitman Building, Freda Street, London. SE16 4BW', margin + 110, currentY + 5)

  doc.setFont('helvetica', 'bold')
  doc.text('Mobile:', margin + 3, currentY + 11)
  doc.setFont('helvetica', 'normal')
  doc.text('07939303144', margin + 35, currentY + 11)

  doc.setFont('helvetica', 'bold')
  doc.text('Email:', margin + 3, currentY + 17)
  doc.setFont('helvetica', 'normal')
  doc.text('divineheritagechildcare@gmail.com', margin + 35, currentY + 17)

  currentY += 26

  // Section: Details of Parental responsibility
  renderSectionHeader('Details of Parental responsibility, legal contact, & residence arrangements:')

  const p1 = app.page1 || {
    childFullName: app.child?.fullName || '',
    childDob: app.child?.dob || '',
    childGender: app.child?.sex || '',
    parent1Name: app.parent1?.fullName || '',
    parent1Address: app.parent1?.homeAddress || '',
    parent1Mobile: app.parent1?.mobile || '',
    parent1Email: app.parent1?.email || '',
    parent1Profession: '',
    parent1WorkAddress: '',
    parent1WorkPhone: '',
    parent2Name: '',
    parent2Address: '',
    parent2Mobile: '',
    parent2Email: '',
    parent2Profession: '',
    parent2WorkAddress: '',
    parent2WorkPhone: '',
    whoWillBringCollect: '',
    contactDetails: '',
  }

  // Child line
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Full name of Child:', margin, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(p1.childFullName || '—', margin + 32, currentY)

  doc.setFont('helvetica', 'bold')
  doc.text('Date of Birth:', margin + 105, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(p1.childDob || '—', margin + 128, currentY)

  doc.setFont('helvetica', 'bold')
  doc.text('Gender:', margin + 155, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(p1.childGender || '—', margin + 170, currentY)
  currentY += 6

  const childRace = p1.childRaceEthnicity || app.page4?.childRaceEthnicity || ''
  const childRel = p1.religion || app.page4?.religion || ''
  if (childRace || childRel) {
    doc.setFont('helvetica', 'bold')
    doc.text("Child's Race & Ethnic background:", margin, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(childRace || '—', margin + 52, currentY)

    doc.setFont('helvetica', 'bold')
    doc.text('Religion:', margin + 120, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(childRel || '—', margin + 135, currentY)
    currentY += 6
  }

  // Parent 1 vs Parent 2 Columns
  const colW = (contentWidth - 6) / 2
  const col2X = margin + colW + 6

  doc.setFillColor(...BG_HEADER)
  doc.rect(margin, currentY, colW, 6, 'F')
  doc.rect(col2X, currentY, colW, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Name of Parent/ Carer/ Guardian 1:', margin + 2, currentY + 4.2)
  doc.text('Name of Parent/ Carer/ Guardian 2:', col2X + 2, currentY + 4.2)
  currentY += 8

  doc.setFont('helvetica', 'normal')
  doc.text(p1.parent1Name || '—', margin + 2, currentY)
  doc.text(p1.parent2Name || '—', col2X + 2, currentY)
  currentY += 6

  const renderParentRow = (label: string, v1: string, v2: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT_MUTED)
    doc.text(label.toUpperCase(), margin, currentY)
    doc.text(label.toUpperCase(), col2X, currentY)
    currentY += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_DARK)
    doc.text(v1 || '—', margin, currentY)
    doc.text(v2 || '—', col2X, currentY)
    currentY += 6
  }

  renderParentRow('Home Address:', p1.parent1Address, p1.parent2Address)
  renderParentRow('Phone Mobile:', p1.parent1Mobile, p1.parent2Mobile)
  renderParentRow('Email:', p1.parent1Email, p1.parent2Email)
  renderParentRow('Profession:', p1.parent1Profession, p1.parent2Profession)
  renderParentRow('Work / College Address:', p1.parent1WorkAddress, p1.parent2WorkAddress)
  renderParentRow('Work Phone:', p1.parent1WorkPhone, p1.parent2WorkPhone)

  // Collection
  doc.setFont('helvetica', 'bold')
  doc.text('Who will bring/collect the child from the childminder:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(p1.whoWillBringCollect || '—', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Contact Details:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(p1.contactDetails || '—', margin, currentY)
  currentY += 9

  // Emergency Contact 1
  renderSectionHeader('Emergency Contact(s) - Mandatory, all tasks must be finished')
  const em1 = app.emergencyContacts?.[0] || { name: '', contactNo: '', relationship: '' }
  doc.setFont('helvetica', 'bold')
  doc.text(`1. Name: ${em1.name || '—'}    |    Contact no: ${em1.contactNo || '—'}    |    Relationship: ${em1.relationship || '—'}`, margin + 2, currentY)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(2)
  currentY = 20

  renderSectionHeader('Emergency Contact(s) (Continued)')
  for (let i = 1; i <= 3; i++) {
    const em = app.emergencyContacts?.[i] || { name: '', contactNo: '', relationship: '' }
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. Name:`, margin, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(em.name || '—', margin + 18, currentY)
    doc.setFont('helvetica', 'bold')
    doc.text('Contact no:', margin + 75, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(em.contactNo || '—', margin + 95, currentY)
    doc.setFont('helvetica', 'bold')
    doc.text('Relationship:', margin + 135, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(em.relationship || '—', margin + 158, currentY)
    currentY += 6
  }
  currentY += 6

  // Funded Hours / Free Entitlements
  renderSectionHeader('Funded Hours / Free Entitlements')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const fundedIntro =
    'All children aged 3 years old are eligible for the universal 15-hour entitlement from the term after their third birthday. Each eligible child is entitled to a maximum of 15 hours per week over no fewer than 38 weeks per year, during term-time only.\n\nOnly children aged 9 months to 2 years are eligible to take up a free entitlement place. Eligible parents must provide a copy of their confirmation code to obtain a free space.'
  const splitIntro = doc.splitTextToSize(fundedIntro, contentWidth)
  doc.text(splitIntro, margin, currentY)
  currentY += splitIntro.length * 4 + 4

  const p2 = app.page2 || {
    universal15Hrs: '',
    workingParent15HrsUnder2Code: '',
    workingParent15Hrs2yoCode: '',
    workingParent30HrsCode: '',
    nationalInsuranceNo: '',
    parentClaimingDob: '',
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Which of the free entitlements are you claiming for this child?', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`• 15hrs universal entitlement for 3 & 4-year-olds?  ${p2.universal15Hrs || 'No'}`, margin, currentY)
  currentY += 5
  doc.text(`• 15hrs working parent entitlement (9-23 months old) Code:  ${p2.workingParent15HrsUnder2Code || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`• 15hrs working parent Entitlement (2 years old) Code:  ${p2.workingParent15Hrs2yoCode || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`• 30 hrs working parent entitlement (3 & 4-year-old) code:  ${p2.workingParent30HrsCode || '—'}`, margin, currentY)
  currentY += 7

  doc.setFont('helvetica', 'bold')
  doc.text(`National Insurance no for parent claiming funded hours:  ${p2.nationalInsuranceNo || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Parent claiming funded hours DOB:  ${p2.parentClaimingDob || '—'}`, margin, currentY)
  currentY += 7

  doc.setFont('helvetica', 'italic')
  const fundingRules =
    'Parents must reapply for the 30-hour funding term, as this is not an automatic enrolment. The 30-hour funding can be used up to 10 hours per day.\nA separate fee is required from parents for children accessing 15/30 hours of free childcare for any hours beyond their weekly entitlement.'
  const splitRules = doc.splitTextToSize(fundingRules, contentWidth)
  doc.text(splitRules, margin, currentY)
  currentY += splitRules.length * 4 + 6

  // Fees Schedule
  renderSectionHeader('Fees:')
  doc.setFont('helvetica', 'normal')
  doc.text('Rate: Hourly - £12.00          Day rate: £70.00          Full-time £330.00 per week', margin, currentY)
  currentY += 5
  doc.text('Ad hoc fees: £18:00 payable on booking.', margin, currentY)
  currentY += 5
  doc.text('Babies under 8 months: - £80.00 per day          Hourly – £14.00', margin, currentY)
  currentY += 5
  doc.text('School pickups: - 3 pm – 6 pm - £30.00 per day', margin, currentY)
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Flexible Hours: Minimum 3 hrs & above.', margin, currentY)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(3)
  currentY = 20

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Fees are payable in advance on a weekly, 4-weekly, or monthly basis. Fees can be paid by cash, tax-free childcare voucher, Universal Credit, or online bank transfer.', margin, currentY)
  currentY += 8

  // Session & Start date required
  renderSectionHeader('Session & Start date required')
  doc.setFont('helvetica', 'normal')
  doc.text('Full Day: 8-6 pm    Friday closes at 5 PM', margin, currentY)
  currentY += 5
  const reqStart = app.page3?.requiredStartDate || app.page4?.contractStartDate || app.sessions?.requiredStartDate || '—'
  doc.text(`Required Start Date: ${reqStart}`, margin, currentY)
  currentY += 8

  // Early Years Funded Hours Table
  doc.setFont('helvetica', 'bold')
  doc.text('Early Years Funded Hours (Only complete if you’re entitled to funded hours):', margin, currentY)
  currentY += 4

  const fSch = app.page3?.fundedSchedule || {
    row8to1: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
    row12to5: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
    rowFullDay: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
  }

  const times = [
    { label: '8 – 1pm', data: fSch.row8to1 },
    { label: '12 - 12:45 - 5 - 5:45 PM', data: fSch.row12to5 },
    { label: 'Full Day 8-6 pm', data: fSch.rowFullDay },
  ]

  // Table header
  doc.setFillColor(...BG_HEADER)
  doc.rect(margin, currentY, contentWidth, 5, 'F')
  doc.text('Time', margin + 2, currentY + 3.5)
  doc.text('Mon', margin + 55, currentY + 3.5)
  doc.text('Tue', margin + 75, currentY + 3.5)
  doc.text('Wed', margin + 95, currentY + 3.5)
  doc.text('Thu', margin + 115, currentY + 3.5)
  doc.text('Fri', margin + 135, currentY + 3.5)
  doc.text('Total Hrs', margin + 155, currentY + 3.5)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  times.forEach((t) => {
    doc.text(t.label, margin + 2, currentY + 3.5)
    doc.text(t.data?.monday ? 'Yes' : '—', margin + 55, currentY + 3.5)
    doc.text(t.data?.tuesday ? 'Yes' : '—', margin + 75, currentY + 3.5)
    doc.text(t.data?.wednesday ? 'Yes' : '—', margin + 95, currentY + 3.5)
    doc.text(t.data?.thursday ? 'Yes' : '—', margin + 115, currentY + 3.5)
    doc.text(t.data?.friday ? 'Yes' : '—', margin + 135, currentY + 3.5)
    doc.text(t.data?.totalHrs || '—', margin + 155, currentY + 3.5)
    currentY += 5
  })
  currentY += 2
  doc.setFont('helvetica', 'bold')
  doc.text('Full Day 8-6 pm', margin, currentY)
  currentY += 4
  doc.text('Please note that I only Accept children for a minimum of 2 full days and 3 part time days', margin, currentY)
  currentY += 6

  // Contracted Hours Table
  doc.setFont('helvetica', 'bold')
  doc.text('Contracted Hours:', margin, currentY)
  currentY += 4

  const cHours = app.page3?.contractedHours || {
    monday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
    tuesday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
    wednesday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
    thursday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
    friday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
    totalHoursPerWeek: String(app.contractedSchedule?.totalContractedHours || ''),
    totalCostPerWeek: String(app.contractedSchedule?.totalWeeklyCost || ''),
  }

  doc.setFillColor(...BG_HEADER)
  doc.rect(margin, currentY, contentWidth, 5, 'F')
  doc.text('Day', margin + 2, currentY + 3.5)
  doc.text('Time From', margin + 40, currentY + 3.5)
  doc.text('Time To', margin + 75, currentY + 3.5)
  doc.text('Total Hours', margin + 115, currentY + 3.5)
  doc.text('Hourly/weekly Rate £', margin + 150, currentY + 3.5)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  ;(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).forEach((d) => {
    const row = cHours[d]
    doc.text(d.charAt(0).toUpperCase() + d.slice(1), margin + 2, currentY + 3.5)
    doc.text(row?.timeFrom || '—', margin + 40, currentY + 3.5)
    doc.text(row?.timeTo || '—', margin + 75, currentY + 3.5)
    doc.text(row?.totalHours ? `${row.totalHours} hrs` : '—', margin + 115, currentY + 3.5)
    doc.text(row?.rate || '—', margin + 150, currentY + 3.5)
    currentY += 5
  })

  doc.setFont('helvetica', 'bold')
  doc.setFillColor(...BG_HEADER)
  doc.rect(margin, currentY, contentWidth, 5, 'F')
  doc.text('Total hours/cost per week:', margin + 2, currentY + 3.5)
  doc.text(`${cHours.totalHoursPerWeek || '0'} hrs`, margin + 115, currentY + 3.5)
  doc.text(cHours.totalCostPerWeek || '£0.00', margin + 150, currentY + 3.5)
  currentY += 8

  // Automatic Fee & Advance Payment Schedule
  const isBaby = isChildUnder8Months(
    app.page1?.childDob || app.child?.dob,
    app.page3?.requiredStartDate || app.page4?.contractStartDate || app.sessions?.requiredStartDate
  )
  const feeSched = calculateWeeklySchedule(app.page3?.contractedHours, isBaby)
  const fundedRes = calculateFundedHours(app.page3?.fundedSchedule)

  renderSectionHeader('Automatic Fee & Advance Payment Schedule')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_MUTED)
  doc.text(
    `Rate applied: ${isBaby ? 'Baby <8 months (£14.00/hr, £80.00/day)' : 'Standard (£12.00/hr, £70.00/day)'}` +
      (feeSched.isFullTimeDiscount ? ' • Full-time discount applied (£330.00/wk)' : ''),
    margin + 2,
    currentY
  )
  currentY += 4.5

  const feeBoxW = (contentWidth - 4) / 3
  const feeMetrics = [
    { label: 'Weekly Fee', val: feeSched.grossCostStr || '£0.00', sub: `${feeSched.totalHours} hrs/week` },
    { label: '4-Weekly advance', val: feeSched.fourWeeklyCostStr || '£0.00', sub: '4 weeks contracted' },
    { label: 'Monthly advance', val: feeSched.monthlyCostStr || '£0.00', sub: 'Calendar month (52wks/12)' },
  ]

  feeMetrics.forEach((m, idx) => {
    const boxX = margin + idx * (feeBoxW + 2)
    doc.setDrawColor(...BORDER_COLOR)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(boxX, currentY, feeBoxW, 15, 1, 1, 'FD')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_MUTED)
    doc.text(m.label, boxX + 2, currentY + 3.8)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(m.val, boxX + 2, currentY + 8.5)

    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_MUTED)
    doc.text(m.sub, boxX + 2, currentY + 12.5)
  })

  currentY += 18

  if (fundedRes.totalFundedHrs > 0) {
    doc.setFillColor(239, 246, 255)
    doc.setDrawColor(191, 219, 254)
    doc.roundedRect(margin, currentY, contentWidth, 9, 1, 1, 'FD')

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 138)
    doc.text(`Early Years Entitlement: ${fundedRes.totalFundedHrs} hrs/week funded.`, margin + 3, currentY + 4)

    const netWeekly = Math.max(
      0,
      feeSched.totalHours > fundedRes.totalFundedHrs
        ? (feeSched.totalHours - fundedRes.totalFundedHrs) * (isBaby ? 14 : 12)
        : 0
    )
    doc.text(`Net Weekly Fee: £${netWeekly.toFixed(2)}`, pageWidth - margin - 3, currentY + 4, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(
      feeSched.totalHours > fundedRes.totalFundedHrs
        ? `Parent payable hours: ${Math.round((feeSched.totalHours - fundedRes.totalFundedHrs) * 10) / 10} hrs beyond entitlement.`
        : 'All contracted hours covered within entitlement.',
      margin + 3,
      currentY + 7.5
    )
    currentY += 12
  }

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Notice / Cancellation minimum charge (4 weeks' contracted cost): ${feeSched.fourWeeksNoticeCostStr}`, margin + 2, currentY)
  currentY += 5

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(4)
  currentY = 20

  renderSectionHeader('Contract Duration & Terms')
  const page4Data = app.page4
  const p4 = {
    contractStartDate: page4Data?.contractStartDate || '',
    contractEndDate: page4Data?.contractEndDate || '',
    childRaceEthnicity: page4Data?.childRaceEthnicity || app.page1?.childRaceEthnicity || '',
    familyRaceEthnicity: page4Data?.familyRaceEthnicity || '',
    languagesUnderstoodChild: page4Data?.languagesUnderstoodChild || '',
    languagesSpokenFamily: page4Data?.languagesSpokenFamily || '',
    languagesSpokenChild: page4Data?.languagesSpokenChild || '',
    translationRequired: page4Data?.translationRequired || '',
    religion: page4Data?.religion || app.page1?.religion || '',
    festivalsCelebrated: page4Data?.festivalsCelebrated || '',
    previousChildcare: page4Data?.previousChildcare || app.page1?.previousChildcare || '',
  }

  doc.setFont('helvetica', 'bold')
  doc.text(`Start of contract: ${p4.contractStartDate || '—'}`, margin, currentY)
  currentY += 5
  doc.setFont('helvetica', 'italic')
  doc.text('A minimum of four weeks’ notice is required to end the contract.', margin, currentY)
  currentY += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Absence:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Occasional day off by parent/child: Full fee applied.\nParent/child on holiday or sickness: Full fee to be paid.\nChildminder holiday – Full fee applied\nChildminder sickness: No fee will be paid.', margin, currentY)
  currentY += 18



  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(5)
  currentY = 20

  renderSectionHeader('Medical Information')
  const page5Data = app.page5
  const p5 = {
    gpName: page5Data?.gpName || '',
    gpAddress: page5Data?.gpAddress || '',
    gpNameAddress: page5Data?.gpNameAddress || '',
    gpPhone: page5Data?.gpPhone || '',
    healthVisitorName: page5Data?.healthVisitorName || '',
    immunisationsUpToDate: page5Data?.immunisationsUpToDate || '',
    dentalTreatment: page5Data?.dentalTreatment || '',
    medicalNeedsDetails: page5Data?.medicalNeedsDetails || app.page1?.specialNeedsOrDisabilities || '',
    allergiesDetails: page5Data?.allergiesDetails || '',
  }

  doc.setFont('helvetica', 'bold')
  doc.text("General Practitioner's Name:", margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const gpNameDisplay = p5.gpName || (p5.gpNameAddress ? p5.gpNameAddress.split('\n')[0] : '—')
  doc.text(gpNameDisplay, margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'bold')
  doc.text("General Practitioner's Address:", margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const gpAddressDisplay = p5.gpAddress || (p5.gpNameAddress ? p5.gpNameAddress : '—')
  const gpLines = doc.splitTextToSize(gpAddressDisplay, contentWidth)
  doc.text(gpLines, margin, currentY)
  currentY += gpLines.length * 4 + 2

  doc.setFont('helvetica', 'bold')
  doc.text(`Phone no: ${p5.gpPhone || '—'}        Health visitor name: ${p5.healthVisitorName || '—'}`, margin, currentY)
  currentY += 6

  doc.text(`Immunisations: Are they up to date?  ${p5.immunisationsUpToDate || '—'}        Dental treatment?  ${p5.dentalTreatment || '—'}`, margin, currentY)
  currentY += 6

  doc.text('Any childhood illnesses/ serious condition?:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const illnessLines = p5.medicalNeedsDetails ? doc.splitTextToSize(p5.medicalNeedsDetails, contentWidth) : ['None stated']
  doc.text(illnessLines, margin, currentY)
  currentY += illnessLines.length * 4 + 2

  doc.setFont('helvetica', 'bold')
  doc.text('Any Allergies/ health conditions (asthma, eczema, inhaler/ epipen, penicillin, food, plaster, etc):', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const allergyLines = p5.allergiesDetails ? doc.splitTextToSize(p5.allergiesDetails, contentWidth) : ['None stated']
  doc.text(allergyLines, margin, currentY)
  currentY += allergyLines.length * 4 + 5

  // Consent on Page 5
  renderSectionHeader('Consent - Please tick to give permission')
  const p6 = app.page6 || {
    emergencyHospitalTreatment: false,
    localOutings: false,
    photosVideosLearningRecord: false,
    transportInVehicle: false,
    transitionRecords: false,
    photosArtworkSetting: '',
    photosWebsite: '',
  }

  doc.setFontSize(8)
  if (p6.photosArtworkSetting) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Photos/artwork displayed in setting: ${p6.photosArtworkSetting === 'give' ? 'I give permission' : 'I do not permit'}`, margin, currentY)
    currentY += 5
  }
  if (p6.photosWebsite) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Photos/work included on website: ${p6.photosWebsite === 'give' ? 'I give permission' : 'I do not permit'}`, margin, currentY)
    currentY += 5
  }
  currentY += 2

  // Sickness on Page 5
  renderSectionHeader('Sickness')
  doc.setFont('helvetica', 'normal')
  const sickText =
    "Divine Heritage may contact you if your child is unwell (e.g., persistent coughing or sneezing) to prevent spreading illness to other children and staff.\n\nDo not send your child if they were given antibiotics or Calpol before the session.\n\nVomiting/Diarrhoea: Children must stay home for 48 hours after their last episode and until completely recovered."
  const splitSick = doc.splitTextToSize(sickText, contentWidth)
  doc.text(splitSick, margin, currentY)
  currentY += splitSick.length * 3.8 + 6

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6: Collection, Declarations & Signatures
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(6)
  currentY = 20

  renderSectionHeader('Collection')
  const colPoints = [
    '• Full payment is required in advance for all contracted hours. No refunds or discounts are given for early collections, or absences.',
    '• Early drop offs require prior arrangement due to strict staff to child ratio limits.',
    '• Arrive 5 minutes before your scheduled pick up time. Repeated late pick ups constitute a breach of contract.',
    '• A late collection fee will incur a fine of £3.00 per minute.',
    '• Fines are payable and failure to pay will result in withdrawal of service until payment is made.',
    '• Call at least 30 minutes in advance (or as soon as possible) if your child will be late or absent.',
  ]
  colPoints.forEach((point) => {
    const splitPoint = doc.splitTextToSize(point, contentWidth)
    doc.text(splitPoint, margin, currentY)
    currentY += splitPoint.length * 4.2 + 2.5
  })

  currentY += 4
  renderSectionHeader('Declarations & Signatures')
  currentY += 4

  // Signatures
  const p7 = app.page7 || {
    parentSignature: '',
    parentName: app.page1?.parent1Name || app.parent1?.fullName || '',
    parentDate: app.submittedAt ? app.submittedAt.split('T')[0] : '',
    childminderName: 'Avril Cole',
    childminderDate: app.submittedAt ? app.submittedAt.split('T')[0] : '',
    childminderSigned: true,
  }

  doc.rect(margin, currentY, colW, 40)
  doc.rect(col2X, currentY, colW, 40)

  doc.setFont('helvetica', 'bold')
  doc.text('Parent / Guardian Signature:', margin + 3, currentY + 5)
  doc.text('Childminder Signature:', col2X + 3, currentY + 5)

  if (p7.parentSignature && p7.parentSignature.startsWith('data:image')) {
    try {
      doc.addImage(p7.parentSignature, 'PNG', margin + 3, currentY + 7, 45, 16)
    } catch {
      doc.text('[Signed Electronically]', margin + 3, currentY + 16)
    }
  } else {
    doc.text('[Signed Electronically]', margin + 3, currentY + 16)
  }

  doc.setFont('times', 'italic')
  doc.setFontSize(14)
  doc.text('Avril Cole', col2X + 15, currentY + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  doc.text(`Name: ${p7.parentName || '—'}`, margin + 3, currentY + 28)
  doc.text(`Date: ${p7.parentDate || '—'}`, margin + 3, currentY + 34)

  doc.text('Name: Avril Cole', col2X + 3, currentY + 28)
  doc.text(`Date: ${p7.childminderDate || p7.parentDate || '—'}`, col2X + 3, currentY + 34)

  currentY += 45
  doc.setFont('helvetica', 'italic')
  doc.text('Please note that the Parent/Guardian signing above is responsible for paying fees.', margin, currentY)

  const blob = doc.output('blob')
  const base64 = doc.output('datauristring')

  return { doc, blob, base64 }
}

export async function downloadApplicationPDF(app: ApplicationRecord): Promise<void> {
  const { doc } = await generateApplicationPDF(app)
  const childName = app.page1?.childFullName || app.child?.fullName || 'Child'
  const sanitized = childName.replace(/[^a-zA-Z0-9]/g, '_')
  const ref = app.applicationId || app.id || 'DH'
  doc.save(`Divine-Heritage-Application-${sanitized}-${ref}.pdf`)
}
