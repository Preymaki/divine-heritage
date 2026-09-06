/**
 * Divine Heritage Application PDF Generator
 *
 * Faithfully generates an official multi-page PDF document representing
 * the exact 7 pages of the Divine Heritage Childcare Application Form.
 */

import { jsPDF } from 'jspdf'
import type { ApplicationRecord } from '@appTypes/application'

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
    doc.text(`Page ${pageNumber} of 7`, margin, pageHeight - 8)
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
  currentY += 8

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
  doc.setFont('helvetica', 'bold')
  doc.text('Please note that the Day rate applies if care is provided for over 5 hours.', margin, currentY)
  currentY += 4
  doc.text('Charges are based on an hourly rate, and I do not offer half-hour charges.', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Fees are payable in advance on a weekly, 4-weekly, or monthly basis. Fees can be paid by cash, tax-free childcare voucher, Universal Credit, or online bank transfer to the following account:', margin, currentY)
  currentY += 6

  // Bank Details
  doc.setFillColor(...BG_HEADER)
  doc.rect(margin, currentY, contentWidth, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Bank Details:', margin + 3, currentY + 4)
  doc.setFont('helvetica', 'normal')
  doc.text('NatWest Bank', margin + 3, currentY + 9)
  doc.text('Account Name: Avril Cole', margin + 45, currentY + 9)
  doc.text('Sort Code: 50-10-29', margin + 105, currentY + 9)
  doc.text('Account Number: 25869043', margin + 145, currentY + 9)
  currentY += 16

  // Session & Start date required
  renderSectionHeader('Session & Start date required')
  doc.setFont('helvetica', 'normal')
  doc.text('Morning: 08:00 -1:00 PM    Afternoon: 12 -12:45PM to 5-5:45 PM    Full Day: 08:00 – 6:00PM', margin, currentY)
  currentY += 5
  doc.text('Friday closes at 5 PM', margin, currentY)
  currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Please note that I Only Accept Children for a minimum of 2 Full days and 3 part-time days.', margin, currentY)
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
    { label: 'Full day', data: fSch.rowFullDay },
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(4)
  currentY = 20

  renderSectionHeader('Contract Duration & Terms')
  const p4 = app.page4 || {
    contractStartDate: '',
    contractEndDate: '',
    childRaceEthnicity: '',
    familyRaceEthnicity: '',
    languagesUnderstoodChild: '',
    languagesSpokenFamily: '',
    languagesSpokenChild: '',
    translationRequired: '',
    religion: '',
    festivalsCelebrated: '',
    previousChildcare: '',
  }

  doc.setFont('helvetica', 'bold')
  doc.text(`Start of contract: ${p4.contractStartDate || '—'}        End of Contract: ${p4.contractEndDate || '—'}`, margin, currentY)
  currentY += 5
  doc.setFont('helvetica', 'italic')
  doc.text('A minimum of four weeks’ notice is required to end the contract if no end date is stated.', margin, currentY)
  currentY += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Absence:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Occasional day off by parent/child: Full fee applied.\nParent/child on holiday or sickness: Full fee to be paid.\nChildminder holiday – Full fee applied\nChildminder sickness: No fee will be paid.', margin, currentY)
  currentY += 18

  doc.setFont('helvetica', 'bold')
  doc.text('Swapping day:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('The session and hours are FIXED and not interchangeable. If an extra day(s) is required, it’s chargeable.', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Change of Contracted Day(s):', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('A minimum of 2 weeks’ notice is required to amend your contracted days, subject to availability.', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Holidays & Settling-in:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('The full fee will still be charged on bank holidays if the day falls on your child’s contracted or regular working day.\nSettling-in period: I offer up to 2 hours of complimentary settling-in time, prorated for part-time.\nRetainer Fee: Parents pay a 50% fee to confirm and reserve their child’s place for the following term.', margin, currentY)
  currentY += 15

  doc.setFont('helvetica', 'bold')
  doc.text('Food & Healthy Eating:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Due to life-threatening allergies, I ask that parents bring in their children’s food. I provide healthy, complimentary snack options such as fruit, vegetables, sandwiches, rice cakes, breadsticks or similar choices.', margin, currentY)
  currentY += 10

  renderSectionHeader('Race & Ethnicity')
  doc.text(`Child: ${p4.childRaceEthnicity || '—'}        Family: ${p4.familyRaceEthnicity || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Language(s) understood by child: ${p4.languagesUnderstoodChild || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Language(s) spoken by family: ${p4.languagesSpokenFamily || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Language(s) spoken by child: ${p4.languagesSpokenChild || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Does family require translation & in which language? ${p4.translationRequired || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Religion: ${p4.religion || '—'}        Festivals family celebrates: ${p4.festivalsCelebrated || '—'}`, margin, currentY)
  currentY += 6
  doc.text(`Child's previous childcare: ${p4.previousChildcare || '—'}`, margin, currentY)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(5)
  currentY = 20

  renderSectionHeader('Previous Nursery, Family Members, Social Service & Medical')
  const p5 = app.page5 || {
    nurseryAttendedName: '',
    nurseryAttendedAddress: '',
    familyChildren: [
      { name: '', dob: '' },
      { name: '', dob: '' },
      { name: '', dob: '' },
      { name: '', dob: '' },
      { name: '', dob: '' },
      { name: '', dob: '' },
    ],
    positionInFamily: '',
    childInCareOrLookedAfter: '',
    lookedAfterDetails: '',
    medicalNeedsDetails: '',
    allergiesDetails: '',
    specialDietaryRequirements: '',
  }

  doc.setFont('helvetica', 'bold')
  doc.text(`Name of Nursery/ childcare attended:  ${p5.nurseryAttendedName || '—'}`, margin, currentY)
  currentY += 5
  doc.text(`Address (if known):  ${p5.nurseryAttendedAddress || '—'}`, margin, currentY)
  currentY += 8

  doc.text('Other Family Members (Children in age order):', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const famKids = p5.familyChildren || []
  for (let i = 0; i < 3; i++) {
    const k1 = famKids[i]
    const k2 = famKids[i + 3]
    doc.text(`${i + 1}. ${k1?.name || '—'} (DOB: ${k1?.dob || '—'})`, margin, currentY)
    doc.text(`${i + 4}. ${k2?.name || '—'} (DOB: ${k2?.dob || '—'})`, margin + 90, currentY)
    currentY += 5
  }
  doc.setFont('helvetica', 'bold')
  doc.text(`Position in family:  ${p5.positionInFamily ? `Position ${p5.positionInFamily}` : '—'}`, margin, currentY)
  currentY += 8

  doc.text(`Social Service - Is your child "in care" or a "looked-after" service?  ${p5.childInCareOrLookedAfter || 'No'}`, margin, currentY)
  currentY += 4
  if (p5.lookedAfterDetails) {
    doc.setFont('helvetica', 'normal')
    doc.text(`Details: ${p5.lookedAfterDetails}`, margin, currentY)
    currentY += 6
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Medical Needs:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(p5.medicalNeedsDetails || 'None stated', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Allergies (penicillin, plasters, anaesthetics, food, stings/bites):', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(p5.allergiesDetails || 'None stated', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Special dietary requirements for food likes/dislikes:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(p5.specialDietaryRequirements || 'None stated', margin, currentY)
  currentY += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Sickness & Medication Policy Notice:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'italic')
  const smNotice =
    'The registered childminder will inform the parent(s) / guardian(s) as soon as reasonably possible if there has been an illness in the household within the previous 24 hours before a contracted period or if unforeseen circumstances prevent them from being available to care for the child. The parent(s) / guardian(s) will inform the registered childminder if the child has been ill within 24 hours before a contracted period and provide written permission if the childminder is required to administer medication and/ or treatment.'
  const splitNotice = doc.splitTextToSize(smNotice, contentWidth)
  doc.text(splitNotice, margin, currentY)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(6)
  currentY = 20

  renderSectionHeader('Please tick to give permission:')
  const p6 = app.page6 || {
    emergencyHospitalTreatment: false,
    localOutings: false,
    photosVideosLearningRecord: false,
    transportInVehicle: false,
    transitionRecords: false,
  }

  const permItems = [
    { label: 'My child can be taken to the hospital for treatment in the event of an emergency', val: p6.emergencyHospitalTreatment },
    { label: 'My child can be taken on local outing trips', val: p6.localOutings },
    { label: 'My child to have photographs/ videos taken for the learning record', val: p6.photosVideosLearningRecord },
    { label: 'My child is to be transported by the childminder/setting in the vehicle used for this purpose', val: p6.transportInVehicle },
    { label: 'My child’s records were passed on to the next setting as part of transition arrangements', val: p6.transitionRecords },
  ]

  doc.setFontSize(8)
  permItems.forEach((item) => {
    doc.setFont('helvetica', 'bold')
    doc.text(item.val ? '[ X ]' : '[   ]', margin, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(item.label, margin + 8, currentY)
    currentY += 5
  })
  currentY += 6

  renderSectionHeader('Sickness')
  doc.setFont('helvetica', 'normal')
  const sickText =
    "Childminders are unable to care for children who are very ill. If a child is persistently coughing and sneezing and is unable to cover their mouth, they will not be able to attend. This is because it's important to prevent the spread of infection to other children and the childminder.\n\nIf a child needs medication like Calpol before the session, they should not be sent to the childminder, as this only masks the symptom and does not prevent the spread of infection.\n\nIf a child vomits or has diarrhoea, they must be picked up immediately and cannot return until they have been symptom-free for 48 hours.\n\nPlease note that this is at my discretion. If I feel that your child is too ill, then I will not be able to provide care, and you will be required to make other arrangements.\n\nAny accidents are recorded in an accident book, which will need your signature to confirm that you have been notified. Any bumps or bruises that your child arrives with will also be recorded in an existing injury book; a brief explanation and your signature will again be required.\n\nYou will be required to fill in a medicine record should your child require any medication whilst in my care."
  const splitSick = doc.splitTextToSize(sickText, contentWidth)
  doc.text(splitSick, margin, currentY)
  currentY += splitSick.length * 3.8 + 6

  renderSectionHeader('Collection Policy')
  const colText =
    'If the child is collected earlier than the stated time, the full bookable fee still applies. All contracted hours must be paid for in full in advance, regardless of attendance, as a position has been reserved for your child, and it will not be possible to fill that position at short notice should your child not attend.\n\nEarly drop-offs will not be accepted without prior arrangement, as this is normally a limited service due to OFSTED number restrictions.\n\nLate drop-off does not constitute late collection.\n\nPlease remember that late collection is very distressing for the child. After 6:00 pm, I am not insured for your child to be on the premises.\n\nParents should come and collect their child/ children 5 minutes before their pick-up time.\n\nPlease inform me by telephone call at least 30 minutes beforehand, or at the earliest opportunity, if you expect to be late or if your child will not be attending for any reason.'
  const splitCol = doc.splitTextToSize(colText, contentWidth)
  doc.text(splitCol, margin, currentY)

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 7
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  renderPageHeader(7)
  currentY = 20

  renderSectionHeader('Terms, Termination, House Rules & Signatures')
  const p7Rules =
    'Repeated late collection will be considered a breach of contract. The following procedures will be implemented in all late collections.\n\nA standard late pickup fee of £5.00 will be charged during the first 10 minutes after your scheduled pickup time. An additional £5 will be charged for every 5 minutes thereafter.\n\nThe total late pickup charge should be paid by the next time you drop off your child.\n\nFailure to pay any fine incurred may result in the withdrawal of the services provided until payment is made.\n\nParents are to pay a 50% retainer fee for term-time childcare. The fee confirms and reserves your child’s place for the following term.\n\nI will give a minimum of FOUR (4) weeks’ notice of my holidays. Full payment will be required when I am on holiday.\n\nPlease do not hesitate to raise any concerns or issues you may have while your child or children are in my care. I am happy to discuss any concerns with you at any time, preferably during pick-ups.'
  const splitP7Rules = doc.splitTextToSize(p7Rules, contentWidth)
  doc.text(splitP7Rules, margin, currentY)
  currentY += splitP7Rules.length * 3.8 + 6

  doc.setFont('helvetica', 'bold')
  doc.text('TERMINATION/ AMENDMENT OF CONTRACT', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  const termText =
    'Four (4) full weeks’ notice, starting the following Monday or later, is required by either party to terminate or amend this agreement. This contract may be terminated without notice if the child’s behaviour becomes such that the safety and well-being of other children in my care are threatened by the parent(s) / guardian(s) or the child’s behaviour.\n\nYou can cancel this agreement within 14 days of signing the form. After that, a minimum charge of 4 weeks’ contracted cost will apply.'
  const splitTerm = doc.splitTextToSize(termText, contentWidth)
  doc.text(splitTerm, margin, currentY)
  currentY += splitTerm.length * 3.8 + 6

  doc.setFont('helvetica', 'bold')
  doc.text('Bringing Things & Health and Safety:', margin, currentY)
  currentY += 4
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Children are allowed to bring only one personal comfort toy during the settling-in period.\nBuggies and pushchairs can be folded and stored in the shed, but they are left at the owner’s risk.\nBikes and scooters can be left, but at your own risk.\nThis Agreement is subject to review at the start of every calendar year.\n(This agreement is valid until it is end-dated, or a new one is signed.)',
    margin,
    currentY,
  )
  currentY += 24

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
