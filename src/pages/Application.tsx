/**
 * Divine Heritage Application Page — /apply
 *
 * Faithfully implements the exact 7-page official Divine Heritage Application Form
 * without any AI-added content or extraneous fields.
 */

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import SectionWrapper from '@components/ui/SectionWrapper'
import type {
  ApplicationFormData,
  ApplicationRecord,
} from '@appTypes/application'
import { submitApplication, downloadApplicationPDF } from '@services/applications'
import {
  calculateDayRate,
  calculateWeeklySchedule,
  calculateFundedHours,
  isChildUnder8Months,
} from '@utils/applicationFees'

// ── Initial State ────────────────────────────────────────────────────────────

const INITIAL_FORM_DATA: ApplicationFormData = {
  page1: {
    childFullName: '',
    childDob: '',
    childGender: '',
    parent1Name: '',
    parent1Address: '',
    parent1Mobile: '',
    parent1Email: '',
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
  },
  emergencyContacts: [
    { name: '', contactNo: '', relationship: '' },
    { name: '', contactNo: '', relationship: '' },
    { name: '', contactNo: '', relationship: '' },
    { name: '', contactNo: '', relationship: '' },
  ],
  page2: {
    universal15Hrs: '',
    workingParent15HrsUnder2Code: '',
    workingParent15Hrs2yoCode: '',
    workingParent30HrsCode: '',
    nationalInsuranceNo: '',
    parentClaimingDob: '',
  },
  page3: {
    requiredStartDate: '',
    sessionPreference: '',
    fundedSchedule: {
      row8to1: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
      row12to5: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
      rowFullDay: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, totalHrs: '' },
    },
    contractedHours: {
      monday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
      tuesday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
      wednesday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
      thursday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
      friday: { timeFrom: '', timeTo: '', totalHours: '', rate: '' },
      totalHoursPerWeek: '',
      totalCostPerWeek: '',
    },
  },
  page4: {
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
  },
  page5: {
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
  },
  page6: {
    emergencyHospitalTreatment: false,
    localOutings: false,
    photosVideosLearningRecord: false,
    transportInVehicle: false,
    transitionRecords: false,
  },
  page7: {
    parentSignature: '',
    parentName: '',
    parentDate: new Date().toISOString().split('T')[0],
    childminderName: 'Avril Cole',
    childminderDate: new Date().toISOString().split('T')[0],
    childminderSigned: true,
  },
}

const PAGE_TITLES = [
  'Page 1: Parental Responsibility & Emergency Contact 1',
  'Page 2: Emergency Contacts, Funded Entitlements & Fees',
  'Page 3: Bank Details, Sessions & Hours Schedules',
  'Page 4: Contract Duration, Terms & Race/Ethnicity',
  'Page 5: Nursery, Family Members, Care & Medical Needs',
  'Page 6: Permissions, Sickness & Collection Policies',
  'Page 7: Terms, Termination & Signatures',
]

export default function Application() {
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedRecord, setSubmittedRecord] = useState<ApplicationRecord | null>(null)

  // Canvas for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Detect baby rate (<8 months old) based on child DOB and start date
  const autoIsBaby = isChildUnder8Months(formData.page1.childDob, formData.page3.requiredStartDate)
  const [manualBabyRate, setManualBabyRate] = useState<boolean | null>(null)
  const isBabyRate = manualBabyRate !== null ? manualBabyRate : autoIsBaby

  // Reactive financial calculations based on form rules
  const weeklyDetails = calculateWeeklySchedule(formData.page3.contractedHours, isBabyRate)
  const fundedSummary = calculateFundedHours(formData.page3.fundedSchedule)

  // Handlers for automatic calculation
  function handleContractedTimeChange(
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    field: 'timeFrom' | 'timeTo',
    value: string
  ) {
    const currentDay = formData.page3.contractedHours[day]
    const nextFrom = field === 'timeFrom' ? value : currentDay.timeFrom
    const nextTo = field === 'timeTo' ? value : currentDay.timeTo

    const dayCalc = calculateDayRate(nextFrom, nextTo, isBabyRate)

    const updatedContracted = {
      ...formData.page3.contractedHours,
      [day]: {
        ...currentDay,
        [field]: value,
        totalHours: dayCalc.hours > 0 ? String(dayCalc.hours) : '',
        rate: dayCalc.costStr,
      },
    }

    const nextWeekly = calculateWeeklySchedule(updatedContracted, isBabyRate)
    updatedContracted.totalHoursPerWeek = nextWeekly.totalHours > 0 ? String(nextWeekly.totalHours) : ''
    updatedContracted.totalCostPerWeek = nextWeekly.totalHours > 0 ? nextWeekly.grossCostStr : ''

    setFormData((prev) => ({
      ...prev,
      page3: {
        ...prev.page3,
        contractedHours: updatedContracted,
      },
    }))
  }

  function handleContractedHoursChange(
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    value: string
  ) {
    const currentDay = formData.page3.contractedHours[day]
    const h = parseFloat(value) || 0
    let rateStr = ''
    if (h > 0) {
      const cost = h > 5 ? (isBabyRate ? 80 : 70) : Math.ceil(h) * (isBabyRate ? 14 : 12)
      rateStr = `£${cost.toFixed(2)}`
    }

    const updatedContracted = {
      ...formData.page3.contractedHours,
      [day]: {
        ...currentDay,
        totalHours: value,
        rate: rateStr,
      },
    }

    const nextWeekly = calculateWeeklySchedule(updatedContracted, isBabyRate)
    updatedContracted.totalHoursPerWeek = nextWeekly.totalHours > 0 ? String(nextWeekly.totalHours) : ''
    updatedContracted.totalCostPerWeek = nextWeekly.totalHours > 0 ? nextWeekly.grossCostStr : ''

    setFormData((prev) => ({
      ...prev,
      page3: {
        ...prev.page3,
        contractedHours: updatedContracted,
      },
    }))
  }

  function handleToggleFundedDay(
    rowKey: 'row8to1' | 'row12to5' | 'rowFullDay',
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    checked: boolean
  ) {
    const updatedSchedule = {
      ...formData.page3.fundedSchedule,
      [rowKey]: {
        ...formData.page3.fundedSchedule[rowKey],
        [day]: checked,
      },
    }

    const res = calculateFundedHours(updatedSchedule)
    updatedSchedule.row8to1.totalHrs = res.row8to1Hrs > 0 ? String(res.row8to1Hrs) : ''
    updatedSchedule.row12to5.totalHrs = res.row12to5Hrs > 0 ? String(res.row12to5Hrs) : ''
    updatedSchedule.rowFullDay.totalHrs = res.rowFullDayHrs > 0 ? String(res.rowFullDayHrs) : ''

    setFormData((prev) => ({
      ...prev,
      page3: {
        ...prev.page3,
        fundedSchedule: updatedSchedule,
      },
    }))
  }

  // Automatically recalculate rates if baby rate changes
  useEffect(() => {
    const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ]

    let changed = false
    const updated = { ...formData.page3.contractedHours }

    days.forEach((d) => {
      const row = updated[d]
      if (row.timeFrom && row.timeTo) {
        const dayCalc = calculateDayRate(row.timeFrom, row.timeTo, isBabyRate)
        if (row.rate !== dayCalc.costStr) {
          updated[d] = { ...row, rate: dayCalc.costStr }
          changed = true
        }
      }
    })

    if (changed) {
      const nextWeekly = calculateWeeklySchedule(updated, isBabyRate)
      updated.totalCostPerWeek = nextWeekly.grossCostStr
      setFormData((prev) => ({
        ...prev,
        page3: {
          ...prev.page3,
          contractedHours: updated,
        },
      }))
    }
  }, [isBabyRate])

  // Setup canvas drawing
  useEffect(() => {
    if (currentPage !== 7) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#1e3a8a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [currentPage])

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getCanvasPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCanvasPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  function stopDrawing() {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      setFormData((prev) => ({
        ...prev,
        page7: { ...prev.page7, parentSignature: dataUrl },
      }))
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setFormData((prev) => ({
      ...prev,
      page7: { ...prev.page7, parentSignature: '' },
    }))
  }

  // Validation
  function validatePage(page: number): boolean {
    const newErrors: Record<string, string> = {}

    if (page === 1) {
      if (!formData.page1.childFullName.trim()) {
        newErrors.childFullName = 'Child full name is required'
      }
      if (!formData.page1.childDob.trim()) {
        newErrors.childDob = 'Child date of birth is required'
      }
      if (!formData.page1.parent1Name.trim()) {
        newErrors.parent1Name = 'Name of Parent / Carer / Guardian 1 is required'
      }
      if (!formData.page1.parent1Mobile.trim()) {
        newErrors.parent1Mobile = 'Parent 1 mobile phone is required'
      }
      if (!formData.page1.parent1Email.trim()) {
        newErrors.parent1Email = 'Parent 1 email is required'
      }
      if (!formData.emergencyContacts[0].name.trim()) {
        newErrors.emergency1Name = 'Emergency contact 1 name is required'
      }
      if (!formData.emergencyContacts[0].contactNo.trim()) {
        newErrors.emergency1ContactNo = 'Emergency contact 1 phone number is required'
      }
    }

    if (page === 7) {
      if (!formData.page7.parentName.trim()) {
        newErrors.parentName = 'Parent / Guardian printed name is required'
      }
      if (!hasSignature && !formData.page7.parentSignature) {
        newErrors.parentSignature = 'Parent / Guardian signature is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validatePage(currentPage)) {
      if (currentPage < 7) {
        setCurrentPage(currentPage + 1)
      }
    }
  }

  function handlePrev() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePage(7)) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitApplication(formData)
      if (result.success) {
        setSubmittedRecord({
          ...formData,
          id: result.applicationId,
          applicationId: result.applicationId,
          status: 'new',
          submittedAt: new Date().toISOString(),
          emailStatus: 'pending',
          pdfGenerated: true,
        })
      } else {
        setSubmitError(result.error || 'Failed to submit application. Please try again.')
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred while submitting.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmation Screen ───────────────────────────────────────────────────
  if (submittedRecord) {
    return (
      <main className="min-h-screen bg-[var(--color-neutral-50)] py-12 md:py-20">
        <SectionWrapper background="white" noPadding className="py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 md:p-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="stroke-[3]" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              Application Submitted Successfully
            </span>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-[var(--font-family-heading)] mb-2">
              Thank you, {submittedRecord.page1.parent1Name || 'Parent / Guardian'}!
            </h1>

            <p className="text-slate-600 text-sm md:text-base mb-6">
              Your application for <strong>{submittedRecord.page1.childFullName}</strong> has been received by Avril Cole at Divine Heritage Childcare Service.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left mb-8 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Application Reference:</span>
                <strong className="font-mono text-slate-900">{submittedRecord.applicationId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Child:</span>
                <strong className="text-slate-900">{submittedRecord.page1.childFullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Start Date:</span>
                <strong className="text-slate-900">{submittedRecord.page3.requiredStartDate || submittedRecord.page4.contractStartDate || 'To be confirmed'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Childminder:</span>
                <strong className="text-slate-900">Avril Cole (07939303144)</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => downloadApplicationPDF(submittedRecord)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Download size={18} />
                Download Completed Form (PDF)
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FBFBFC] pb-20">
      {/* ── Page Header Banner (Skallywags Style) ─────────────────────────── */}
      <section className="bg-gradient-to-b from-rose-50/60 via-white to-white text-slate-800 pt-24 md:pt-28 pb-8 px-4 border-b border-rose-100/70 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 text-[#DB3056] text-xs font-bold uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#DB3056]" aria-hidden="true" />
                Childcare Application Form
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-[var(--font-family-heading)] text-[#DB3056] tracking-tight">
                Divine Heritage Application Form
              </h1>
              <p className="mt-2 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
                First class childcare in an environment which is safe, secure, healthy and stimulating. Please complete the 7-section enrolment agreement below.
              </p>
            </div>

            {/* Childminder Details Card */}
            <div className="bg-white rounded-xl p-4 border-2 border-rose-100 shadow-xs text-xs shrink-0 max-w-sm">
              <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#DB3056]">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Avril Cole</div>
                  <div className="text-slate-500 text-[11px]">Registered Childminder</div>
                </div>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#DB3056] shrink-0" />
                  <a href="tel:07939303144" className="font-semibold text-slate-800 hover:text-[#DB3056] transition-colors">07939 303144</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#DB3056] shrink-0" />
                  <a href="mailto:divineheritagechildcare@gmail.com" className="font-medium hover:text-[#DB3056] transition-colors truncate">divineheritagechildcare@gmail.com</a>
                </div>
                <div className="flex items-start gap-2 text-slate-500 text-[11px] pt-0.5">
                  <MapPin size={13} className="text-[#DB3056] shrink-0 mt-0.5" />
                  <span>5 Pitman Building, Freda St, London SE16 4BW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Tabs Indicator */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#DB3056] text-white text-xs font-bold inline-flex items-center justify-center shadow-xs">
                  {currentPage}
                </span>
                <span className="text-sm">{PAGE_TITLES[currentPage - 1]}</span>
              </span>
              <span className="text-slate-500 font-bold">Step {currentPage} of 7</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    if (pageNum <= currentPage || validatePage(currentPage)) {
                      setCurrentPage(pageNum)
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${pageNum === currentPage
                      ? 'bg-[#DB3056] ring-2 ring-rose-200 shadow-xs'
                      : pageNum < currentPage
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  title={`Go to Page ${pageNum}`}
                  aria-label={`Go to Page ${pageNum}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Form Body ─────────────────────────────────────────────────────── */}
      <SectionWrapper background="background" noPadding className="pt-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 1
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 1 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">

              {/* Section Header */}
              <div className="sk-section-divider">
                <h2 className="sk-section-title">
                  Details of Parental responsibility, legal contact, & residence arrangements:
                </h2>
              </div>

              {/* Child Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="sk-label">
                    Full name of Child: <span className="sk-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.page1.childFullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page1: { ...formData.page1, childFullName: e.target.value },
                      })
                    }
                    className="sk-input"
                  />
                  {errors.childFullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.childFullName}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="sk-label">
                    Date of Birth: <span className="sk-required">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.page1.childDob}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page1: { ...formData.page1, childDob: e.target.value },
                      })
                    }
                    className="sk-input"
                  />
                  {errors.childDob && (
                    <p className="text-xs text-red-500 mt-1">{errors.childDob}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="sk-label">
                    Gender:
                  </label>
                  <div className="flex items-center gap-4 h-[42px]">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="childGender"
                        value="Male"
                        checked={formData.page1.childGender === 'Male'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            page1: { ...formData.page1, childGender: 'Male' },
                          })
                        }
                      />
                      <span>Male □</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="childGender"
                        value="Female"
                        checked={formData.page1.childGender === 'Female'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            page1: { ...formData.page1, childGender: 'Female' },
                          })
                        }
                      />
                      <span>Female □</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Parents 2-column comparison layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                {/* Parent 1 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-800)] bg-slate-100 p-2 rounded-lg">
                    Parent / Carer / Guardian 1
                  </h3>

                  <div>
                    <label className="sk-label">
                      Name of Parent/ Carer/ Guardian 1: <span className="sk-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.page1.parent1Name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Name: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                    {errors.parent1Name && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Name}</p>
                    )}
                  </div>

                  <div>
                    <label className="sk-label">Home Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent1Address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Address: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">
                      Phone Mobile: <span className="sk-required">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.page1.parent1Mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Mobile: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                    {errors.parent1Mobile && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="sk-label">
                      Email: <span className="sk-required">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.page1.parent1Email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Email: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                    {errors.parent1Email && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Email}</p>
                    )}
                  </div>

                  <div>
                    <label className="sk-label">Profession:</label>
                    <input
                      type="text"
                      value={formData.page1.parent1Profession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Profession: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Work / College Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent1WorkAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1WorkAddress: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Work Phone:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent1WorkPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1WorkPhone: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>
                </div>

                {/* Parent 2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 p-2 rounded-lg">
                    Parent / Carer / Guardian 2 (Optional)
                  </h3>

                  <div>
                    <label className="sk-label">
                      Name of Parent/ Carer/ Guardian 2:
                    </label>
                    <input
                      type="text"
                      value={formData.page1.parent2Name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Name: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Home Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent2Address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Address: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Phone Mobile:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent2Mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Mobile: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Email:</label>
                    <input
                      type="email"
                      value={formData.page1.parent2Email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Email: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Profession:</label>
                    <input
                      type="text"
                      value={formData.page1.parent2Profession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Profession: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Work / College Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent2WorkAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2WorkAddress: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>

                  <div>
                    <label className="sk-label">Work Phone:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent2WorkPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2WorkPhone: e.target.value },
                        })
                      }
                      className="sk-input"
                    />
                  </div>
                </div>
              </div>

              {/* Who will bring/collect */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="sk-label">
                    Who will bring/collect the child from the childminder:
                  </label>
                  <input
                    type="text"
                    value={formData.page1.whoWillBringCollect}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page1: { ...formData.page1, whoWillBringCollect: e.target.value },
                      })
                    }
                    className="sk-input"
                  />
                </div>

                <div>
                  <label className="sk-label">
                    Contact Details:
                  </label>
                  <input
                    type="text"
                    value={formData.page1.contactDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page1: { ...formData.page1, contactDetails: e.target.value },
                      })
                    }
                    className="sk-input"
                  />
                </div>
              </div>

              {/* Emergency Contact 1 */}
              <div className="pt-4 border-t-2 border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Emergency Contact(s) - Please note that completing this task is mandatory, and all tasks must be finished.
                </h3>
                <p className="text-xs text-slate-500 mb-4">Contact 1 of 4 (continued on Page 2)</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="sk-label">
                      1. Name: <span className="sk-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContacts[0].name}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts] as [any, any, any, any]
                        updated[0].name = e.target.value
                        setFormData({ ...formData, emergencyContacts: updated })
                      }}
                      className="sk-input"
                    />
                    {errors.emergency1Name && (
                      <p className="text-xs text-red-500 mt-1">{errors.emergency1Name}</p>
                    )}
                  </div>

                  <div>
                    <label className="sk-label">
                      Contact no: <span className="sk-required">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContacts[0].contactNo}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts] as [any, any, any, any]
                        updated[0].contactNo = e.target.value
                        setFormData({ ...formData, emergencyContacts: updated })
                      }}
                      className="sk-input"
                    />
                    {errors.emergency1ContactNo && (
                      <p className="text-xs text-red-500 mt-1">{errors.emergency1ContactNo}</p>
                    )}
                  </div>

                  <div>
                    <label className="sk-label">Relationship:</label>
                    <input
                      type="text"
                      value={formData.emergencyContacts[0].relationship}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts] as [any, any, any, any]
                        updated[0].relationship = e.target.value
                        setFormData({ ...formData, emergencyContacts: updated })
                      }}
                      className="sk-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 2
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 2 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Emergency Contacts 2, 3, 4 */}
              <div className="space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Emergency Contact(s) (Continued)
                  </h2>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="sk-label">
                          {idx + 1}. Name:
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContacts[idx].name}
                          onChange={(e) => {
                            const updated = [...formData.emergencyContacts] as [any, any, any, any]
                            updated[idx].name = e.target.value
                            setFormData({ ...formData, emergencyContacts: updated })
                          }}
                          className="sk-input text-xs py-1.5"
                        />
                      </div>
                      <div>
                        <label className="sk-label">Contact no:</label>
                        <input
                          type="tel"
                          value={formData.emergencyContacts[idx].contactNo}
                          onChange={(e) => {
                            const updated = [...formData.emergencyContacts] as [any, any, any, any]
                            updated[idx].contactNo = e.target.value
                            setFormData({ ...formData, emergencyContacts: updated })
                          }}
                          className="sk-input text-xs py-1.5"
                        />
                      </div>
                      <div>
                        <label className="sk-label">Relationship:</label>
                        <input
                          type="text"
                          value={formData.emergencyContacts[idx].relationship}
                          onChange={(e) => {
                            const updated = [...formData.emergencyContacts] as [any, any, any, any]
                            updated[idx].relationship = e.target.value
                            setFormData({ ...formData, emergencyContacts: updated })
                          }}
                          className="sk-input text-xs py-1.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funded Hours / Free Entitlements */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Funded Hours / Free Entitlements
                  </h2>
                </div>

                <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>
                    All children aged 3 years old are eligible for the universal 15-hour entitlement from the term after their third birthday. Each eligible child is entitled to a maximum of 15 hours per week over no fewer than 38 weeks per year, during term-time only.
                  </p>
                  <p>
                    Only children aged 9 months to 2 years are eligible to take up a free entitlement place. Eligible parents must provide a copy of their confirmation code to obtain a free space.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-900">
                    Which of the free entitlements are you claiming for this child?
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs py-1">
                    <span>• 15hrs universal entitlement for 3 & 4-year-olds?</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="universal15Hrs"
                        value="Yes"
                        checked={formData.page2.universal15Hrs === 'Yes'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            page2: { ...formData.page2, universal15Hrs: 'Yes' },
                          })
                        }
                      />
                      <span>Yes □</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="universal15Hrs"
                        value="No"
                        checked={formData.page2.universal15Hrs === 'No'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            page2: { ...formData.page2, universal15Hrs: 'No' },
                          })
                        }
                      />
                      <span>No □</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                    <span className="sm:col-span-6">• 15hrs working parent entitlement (9-23 months old) Code:</span>
                    <input
                      type="text"
                      value={formData.page2.workingParent15HrsUnder2Code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page2: { ...formData.page2, workingParent15HrsUnder2Code: e.target.value },
                        })
                      }
                      className="sm:col-span-6 sk-input text-xs py-1.5 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                    <span className="sm:col-span-6">• 15hrs working parent Entitlement (2 years old) Code:</span>
                    <input
                      type="text"
                      value={formData.page2.workingParent15Hrs2yoCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page2: { ...formData.page2, workingParent15Hrs2yoCode: e.target.value },
                        })
                      }
                      className="sm:col-span-6 sk-input text-xs py-1.5 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                    <span className="sm:col-span-6">• 30 hrs working parent entitlement (3 & 4-year-old) code:</span>
                    <input
                      type="text"
                      value={formData.page2.workingParent30HrsCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page2: { ...formData.page2, workingParent30HrsCode: e.target.value },
                        })
                      }
                      className="sm:col-span-6 sk-input text-xs py-1.5 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs pt-2">
                    <span className="sm:col-span-6 font-bold">National Insurance no for parent claiming funded hours:</span>
                    <input
                      type="text"
                      value={formData.page2.nationalInsuranceNo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page2: { ...formData.page2, nationalInsuranceNo: e.target.value },
                        })
                      }
                      className="sm:col-span-6 sk-input text-xs py-1.5 px-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                    <span className="sm:col-span-6 font-bold">Parent claiming funded hours DOB:</span>
                    <input
                      type="date"
                      value={formData.page2.parentClaimingDob}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page2: { ...formData.page2, parentClaimingDob: e.target.value },
                        })
                      }
                      className="sm:col-span-6 sk-input text-xs py-1.5 px-3"
                    />
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 pt-2 italic">
                    <p>
                      Parents must reapply for the 30-hour funding term, as this is not an automatic enrolment. The 30-hour funding can be used up to 10 hours per day.
                    </p>
                    <p>
                      A separate fee is required from parents for children accessing 15/30 hours of free childcare for any hours beyond their weekly entitlement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fees schedule */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 underline">Fees:</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-medium">
                    <div>Rate: Hourly - £12.00</div>
                    <div>Day rate: £70.00</div>
                    <div>Full-time £330.00 per week</div>
                  </div>
                  <div>Ad hoc fees: £18:00 payable on booking.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>Babies under 8 months: - £80.00 per day</div>
                    <div>Hourly – £14.00</div>
                  </div>
                  <div>School pickups: - 3 pm – 6 pm - £30.00 per day</div>
                  <div className="font-bold pt-1">Flexible Hours: Minimum 3 hrs & above.</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 3
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 3 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Payment Notes & Bank Details */}
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold">Please note that the Day rate applies if care is provided for over 5 hours.</p>
                <p className="font-bold">Charges are based on an hourly rate, and I do not offer half-hour charges.</p>
                <p>
                  Fees are payable in advance on a weekly, 4-weekly, or monthly basis. Fees can be paid by cash, tax-free childcare voucher, Universal Credit, or online bank transfer to the following account:
                </p>

                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 underline mb-1">Bank Details:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>NatWest Bank</div>
                    <div>Account Name: Avril Cole</div>
                    <div>Sort Code: 50-10-29</div>
                    <div>Account Number: 25869043</div>
                  </div>
                </div>
              </div>

              {/* Session & Start date required */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Session & Start date required
                  </h2>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><strong>Morning:</strong> 08:00 -1:00 PM</div>
                    <div><strong>Afternoon:</strong> 12 -12:45PM to 5-5:45 PM</div>
                    <div><strong>Full Day:</strong> 08:00 – 6:00PM</div>
                  </div>
                  <div className="font-semibold text-slate-800 pt-1">Friday closes at 5 PM</div>
                  <div className="font-bold text-amber-900 pt-1">
                    Please note that I Only Accept Children for a minimum of 2 Full days and 3 part-time days.
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="sk-label">
                    Required Start Date:
                  </label>
                  <input
                    type="date"
                    value={formData.page3.requiredStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page3: { ...formData.page3, requiredStartDate: e.target.value },
                      })
                    }
                    className="sk-input text-xs py-1.5"
                  />
                </div>
              </div>

              {/* Early Years Funded Hours Table */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Early Years Funded Hours</h3>
                  <p className="text-xs text-slate-500 italic">Only complete if you’re entitled to funded hours.</p>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5 text-center">Monday</th>
                        <th className="p-2.5 text-center">Tuesday</th>
                        <th className="p-2.5 text-center">Wednesday</th>
                        <th className="p-2.5 text-center">Thursday</th>
                        <th className="p-2.5 text-center">Friday</th>
                        <th className="p-2.5 text-center">Total Hrs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(
                        [
                          { key: 'row8to1', label: '8 – 1pm (5 hrs/day)' },
                          { key: 'row12to5', label: '12 - 12:45 - 5 - 5:45 PM (5 hrs/day)' },
                          { key: 'rowFullDay', label: 'Full day (max 10 hrs/day)' },
                        ] as const
                      ).map(({ key, label }) => (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-800 whitespace-nowrap">{label}</td>
                          {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => (
                            <td key={day} className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={formData.page3.fundedSchedule[key][day]}
                                onChange={(e) => handleToggleFundedDay(key, day, e.target.checked)}
                                className="w-4 h-4 rounded text-[var(--color-primary-600)] cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="p-2.5 text-center">
                            <input
                              type="text"
                              value={formData.page3.fundedSchedule[key].totalHrs}
                              onChange={(e) => {
                                const updated = { ...formData.page3.fundedSchedule }
                                updated[key].totalHrs = e.target.value
                                setFormData({
                                  ...formData,
                                  page3: { ...formData.page3, fundedSchedule: updated },
                                })
                              }}
                              placeholder="0 hrs"
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs font-semibold bg-slate-50"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {fundedSummary.totalFundedHrs > 0 && (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
                    <span>Total Early Years Funded Hours Claimed:</span>
                    <strong>{fundedSummary.totalFundedHrs} hrs / week</strong>
                  </div>
                )}
              </div>

              {/* Contracted Hours Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Contracted Hours</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Rate applied:</span>
                    <button
                      type="button"
                      onClick={() => setManualBabyRate(false)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${!isBabyRate
                          ? 'bg-[var(--color-primary-600)] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Standard (£12/hr, £70/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualBabyRate(true)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${isBabyRate
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Baby &lt;8m (£14/hr, £80/day)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5">Time From</th>
                        <th className="p-2.5">Time To</th>
                        <th className="p-2.5">Total Hours</th>
                        <th className="p-2.5">Hourly/weekly Rate £</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => {
                        const dayRow = formData.page3.contractedHours[day]
                        return (
                          <tr key={day} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-800 capitalize">{day}</td>
                            <td className="p-2.5">
                              <input
                                type="time"
                                value={dayRow.timeFrom}
                                onChange={(e) => handleContractedTimeChange(day, 'timeFrom', e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="time"
                                value={dayRow.timeTo}
                                onChange={(e) => handleContractedTimeChange(day, 'timeTo', e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={dayRow.totalHours}
                                onChange={(e) => handleContractedHoursChange(day, e.target.value)}
                                placeholder="0"
                                className="w-16 px-2 py-1 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-800"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={dayRow.rate}
                                onChange={(e) => {
                                  const updated = { ...formData.page3.contractedHours }
                                  updated[day].rate = e.target.value
                                  setFormData({
                                    ...formData,
                                    page3: { ...formData.page3, contractedHours: updated },
                                  })
                                }}
                                placeholder="£0.00"
                                className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-800 bg-white"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-slate-800">
                          Total hours/cost per week
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={formData.page3.contractedHours.totalHoursPerWeek}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                page3: {
                                  ...formData.page3,
                                  contractedHours: {
                                    ...formData.page3.contractedHours,
                                    totalHoursPerWeek: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="0 hrs"
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900 bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={formData.page3.contractedHours.totalCostPerWeek}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                page3: {
                                  ...formData.page3,
                                  contractedHours: {
                                    ...formData.page3.contractedHours,
                                    totalCostPerWeek: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="£0.00"
                            className="w-28 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900 bg-white"
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* ── Automatic Fee & Advance Payment Schedule Breakdown ── */}
                <div className="mt-4 p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Automatic Fee & Advance Payment Schedule
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Calculated automatically according to the Application Form's stated fee schedule.
                      </p>
                    </div>
                    {weeklyDetails.isFullTimeDiscount && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Full-time discount applied (£330.00/wk)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Weekly Cost */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[11px]">Weekly Fee:</span>
                      <strong className="text-base text-slate-900 font-bold block mt-0.5">
                        {weeklyDetails.grossCostStr || '£0.00'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {weeklyDetails.totalHours} hrs / week
                      </span>
                    </div>

                    {/* 4-Weekly */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[11px]">4-Weekly in advance:</span>
                      <strong className="text-base text-slate-900 font-bold block mt-0.5">
                        {weeklyDetails.fourWeeklyCostStr || '£0.00'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        4 weeks contracted
                      </span>
                    </div>

                    {/* Monthly */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[11px]">Monthly in advance:</span>
                      <strong className="text-base text-slate-900 font-bold block mt-0.5">
                        {weeklyDetails.monthlyCostStr || '£0.00'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Calendar month (52wks/12)
                      </span>
                    </div>

                    {/* 50% Retainer Fee */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[11px]">50% Retainer Fee:</span>
                      <strong className="text-base text-[var(--color-primary-700)] font-bold block mt-0.5">
                        {weeklyDetails.retainerFee50Str || '£0.00'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        To reserve place next term
                      </span>
                    </div>
                  </div>

                  {/* Funded Hours Offset Display */}
                  {fundedSummary.totalFundedHrs > 0 && (
                    <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <strong>Early Years Entitlement:</strong> {fundedSummary.totalFundedHrs} hrs/week funded.
                        {weeklyDetails.totalHours > fundedSummary.totalFundedHrs ? (
                          <span> (Parent payable hours: {Math.round((weeklyDetails.totalHours - fundedSummary.totalFundedHrs) * 10) / 10} hrs beyond entitlement)</span>
                        ) : (
                          <span> (All contracted hours covered within entitlement)</span>
                        )}
                      </div>
                      <div className="font-bold text-sm text-[var(--color-primary-900)]">
                        Net Weekly Fee: £
                        {Math.max(
                          0,
                          weeklyDetails.totalHours > fundedSummary.totalFundedHrs
                            ? (weeklyDetails.totalHours - fundedSummary.totalFundedHrs) * (isBabyRate ? 14 : 12)
                            : 0
                        ).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* 4 Weeks Notice Policy Charge */}
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                    <span>Notice / Cancellation minimum charge (4 weeks' contracted cost):</span>
                    <strong className="text-slate-800">{weeklyDetails.fourWeeksNoticeCostStr}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 4
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 4 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Contract Duration */}
              <div className="space-y-3">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Contract Duration:
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="sk-label">Start of contract:</label>
                    <input
                      type="date"
                      value={formData.page4.contractStartDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, contractStartDate: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>
                  <div>
                    <label className="sk-label">End of Contract:</label>
                    <input
                      type="date"
                      value={formData.page4.contractEndDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, contractEndDate: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800 pt-1">
                  A minimum of four weeks’ notice is required to end the contract if no end date is stated.
                </p>
              </div>

              {/* Policies list from Document */}
              <div className="pt-4 border-t border-slate-200 space-y-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 underline">Absence:</h3>
                  <p>Occasional day off by parent/child: Full fee applied.</p>
                  <p>Parent/child on holiday or sickness: Full fee to be paid.</p>
                  <p>Childminder holiday – Full fee applied</p>
                  <p>Childminder sickness: No fee will be paid.</p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 underline">Swapping day:</h3>
                  <p>The session and hours are FIXED and not interchangeable. If an extra day(s) is required, it’s chargeable.</p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 underline">Change of Contracted Day(s):</h3>
                  <p>A minimum of 2 weeks’ notice is required to amend your contracted days, subject to availability.</p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 underline">Holidays:</h3>
                  <p>The full fee will still be charged on bank holidays if the day falls on your child’s contracted or regular working day.</p>
                </div>

                <div>
                  <span className="font-bold text-slate-900">Settling-in period:</span> I offer up to 2 hours of complimentary settling-in time, prorated for part-time.
                </div>

                <div>
                  <span className="font-bold text-slate-900">Retainer Fee:</span> Parents pay a 50% fee to confirm and reserve their child’s place for the following term.
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 underline">Food & Healthy Eating</h3>
                  <p>
                    Due to life-threatening allergies, I ask that parents bring in their children’s food. I provide healthy, complimentary snack options such as fruit, vegetables, sandwiches, rice cakes, breadsticks or similar choices.
                  </p>
                </div>
              </div>

              {/* Race & Ethnicity */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Race & Ethnicity
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Child:</label>
                    <input
                      type="text"
                      value={formData.page4.childRaceEthnicity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, childRaceEthnicity: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Family:</label>
                    <input
                      type="text"
                      value={formData.page4.familyRaceEthnicity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, familyRaceEthnicity: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Language(s) understood by the child:</label>
                    <input
                      type="text"
                      value={formData.page4.languagesUnderstoodChild}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, languagesUnderstoodChild: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Language(s) spoken by family:</label>
                    <input
                      type="text"
                      value={formData.page4.languagesSpokenFamily}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, languagesSpokenFamily: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Language(s) spoken by the child:</label>
                    <input
                      type="text"
                      value={formData.page4.languagesSpokenChild}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, languagesSpokenChild: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Does the family require translation & in which language?</label>
                    <input
                      type="text"
                      value={formData.page4.translationRequired}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, translationRequired: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Religion:</label>
                    <input
                      type="text"
                      value={formData.page4.religion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, religion: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Festivals family celebrates festivals:</label>
                    <input
                      type="text"
                      value={formData.page4.festivalsCelebrated}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page4: { ...formData.page4, festivalsCelebrated: e.target.value },
                        })
                      }
                      className="sk-input text-xs py-1.5"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="sk-label">Child's previous childcare:</label>
                  <input
                    type="text"
                    value={formData.page4.previousChildcare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page4: { ...formData.page4, previousChildcare: e.target.value },
                      })
                    }
                    className="sk-input text-xs py-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 5
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 5 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Previous Nursery attended */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Name of Nursery/ childcare attended:</label>
                  <input
                    type="text"
                    value={formData.page5.nurseryAttendedName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, nurseryAttendedName: e.target.value },
                      })
                    }
                    className="sk-input text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Address (if known):</label>
                  <input
                    type="text"
                    value={formData.page5.nurseryAttendedAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, nurseryAttendedAddress: e.target.value },
                      })
                    }
                    className="sk-input text-xs py-1.5"
                  />
                </div>
              </div>

              {/* Other Family Members */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Other Family Members:
                  </h2>
                </div>
                <p className="text-xs text-slate-700">Please provide the names of all children in the family in age order:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column 1: 1, 2, 3 */}
                  <div className="space-y-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 text-xs items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="col-span-1 font-bold">{idx + 1}.</span>
                        <div className="col-span-6">
                          <input
                            type="text"
                            placeholder="Name"
                            value={formData.page5.familyChildren[idx].name}
                            onChange={(e) => {
                              const updated = [...formData.page5.familyChildren] as any
                              updated[idx].name = e.target.value
                              setFormData({ ...formData, page5: { ...formData.page5, familyChildren: updated } })
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="D.O.B"
                            value={formData.page5.familyChildren[idx].dob}
                            onChange={(e) => {
                              const updated = [...formData.page5.familyChildren] as any
                              updated[idx].dob = e.target.value
                              setFormData({ ...formData, page5: { ...formData.page5, familyChildren: updated } })
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Column 2: 4, 5, 6 */}
                  <div className="space-y-2">
                    {[3, 4, 5].map((idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 text-xs items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="col-span-1 font-bold">{idx + 1}.</span>
                        <div className="col-span-6">
                          <input
                            type="text"
                            placeholder="Name"
                            value={formData.page5.familyChildren[idx].name}
                            onChange={(e) => {
                              const updated = [...formData.page5.familyChildren] as any
                              updated[idx].name = e.target.value
                              setFormData({ ...formData, page5: { ...formData.page5, familyChildren: updated } })
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="D.O.B"
                            value={formData.page5.familyChildren[idx].dob}
                            onChange={(e) => {
                              const updated = [...formData.page5.familyChildren] as any
                              updated[idx].dob = e.target.value
                              setFormData({ ...formData, page5: { ...formData.page5, familyChildren: updated } })
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position in family */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                  <span className="font-bold text-slate-800">Position in family:</span>
                  {(['1', '2', '3', '4', '5', '6'] as const).map((pos) => (
                    <label key={pos} className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="positionInFamily"
                        value={pos}
                        checked={formData.page5.positionInFamily === pos}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            page5: { ...formData.page5, positionInFamily: pos },
                          })
                        }
                      />
                      <span>{pos}□</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Service */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-3 text-xs">
                <div className="sk-section-divider">
                  <h2 className="text-base font-bold text-slate-900">
                    Social Service:
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-slate-800">Is your child “in care” or a “looked-after” service?</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="childInCareOrLookedAfter"
                      value="Yes"
                      checked={formData.page5.childInCareOrLookedAfter === 'Yes'}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, childInCareOrLookedAfter: 'Yes' },
                        })
                      }
                    />
                    <span>Yes □</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="childInCareOrLookedAfter"
                      value="No"
                      checked={formData.page5.childInCareOrLookedAfter === 'No'}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, childInCareOrLookedAfter: 'No' },
                        })
                      }
                    />
                    <span>No □</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-800 mb-1">If so, please give the details below:</label>
                  <textarea
                    rows={2}
                    value={formData.page5.lookedAfterDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, lookedAfterDetails: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>
              </div>

              {/* Medical Needs */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-3 text-xs">
                <div className="sk-section-divider">
                  <h2 className="text-base font-bold text-slate-900">
                    Medical Needs:
                  </h2>
                </div>

                <div>
                  <label className="block text-slate-800 mb-1">
                    Does your child have any medical needs (i.e., medical, religious, cultural? If so, please give the details below:
                  </label>
                  <textarea
                    rows={2}
                    value={formData.page5.medicalNeedsDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, medicalNeedsDetails: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 mb-1">
                    Any allergies, e.g. penicillin, plasters, anaesthetics, food allergies, wasp stings/ insect bites?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.page5.allergiesDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, allergiesDetails: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 mb-1">
                    Any special dietary requirements for food likes/dislikes?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.page5.specialDietaryRequirements}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page5: { ...formData.page5, specialDietaryRequirements: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>
              </div>

              {/* Sickness & Medication notice */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 underline">Sickness & Medication:</h3>
                <p>
                  The registered childminder will inform the parent(s) / guardian(s) as soon as reasonably possible if there has been an illness in the household within the previous 24 hours before a contracted period or if unforeseen circumstances prevent them from being available to care for the child. The parent(s) / guardian(s) will inform the registered childminder if the child has been ill within 24 hours before a contracted period and provide written permission if the childminder is required to administer medication and/ or treatment.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 6
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 6 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Permissions */}
              <div className="space-y-4">
                <div className="sk-section-divider">
                  <h2 className="sk-section-title">
                    Please tick to give permission:
                  </h2>
                </div>

                <div className="space-y-3 text-xs text-slate-800">
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.page6.emergencyHospitalTreatment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page6: { ...formData.page6, emergencyHospitalTreatment: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary-600)]"
                    />
                    <span>My child can be taken to the hospital for treatment in the event of an emergency □</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.page6.localOutings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page6: { ...formData.page6, localOutings: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary-600)]"
                    />
                    <span>My child can be taken on local outing trips □</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.page6.photosVideosLearningRecord}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page6: { ...formData.page6, photosVideosLearningRecord: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary-600)]"
                    />
                    <span>My child to have photographs/ videos taken for the learning record □</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.page6.transportInVehicle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page6: { ...formData.page6, transportInVehicle: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary-600)]"
                    />
                    <span>My child is to be transported by the childminder/setting in the vehicle used for this purpose □</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.page6.transitionRecords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page6: { ...formData.page6, transitionRecords: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary-600)]"
                    />
                    <span>My child’s records were passed on to the next setting as part of transition arrangements □</span>
                  </label>
                </div>
              </div>

              {/* Sickness Policy Text */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 underline text-sm">Sickness</h3>
                <p>
                  Childminders are unable to care for children who are very ill. If a child is persistently coughing and sneezing and is unable to cover their mouth, they will not be able to attend. This is because it's important to prevent the spread of infection to other children and the childminder.
                </p>
                <p>
                  If a child needs medication like Calpol before the session, they should not be sent to the childminder, as this only masks the symptom and does not prevent the spread of infection.
                </p>
                <p>
                  If a child vomits or has diarrhoea, they must be picked up immediately and cannot return until they have been symptom-free for 48 hours.
                </p>
                <p>
                  Please note that this is at my discretion. If I feel that your child is too ill, then I will not be able to provide care, and you will be required to make other arrangements.
                </p>
                <p>
                  Any accidents are recorded in an accident book, which will need your signature to confirm that you have been notified. Any bumps or bruises that your child arrives with will also be recorded in an existing injury book; a brief explanation and your signature will again be required.
                </p>
                <p>
                  You will be required to fill in a medicine record should your child require any medication whilst in my care.
                </p>
              </div>

              {/* Collection Policy Text */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 underline text-sm">Collection Policy</h3>
                <p>
                  If the child is collected earlier than the stated time, the full bookable fee still applies. All contracted hours must be paid for in full in advance, regardless of attendance, as a position has been reserved for your child, and it will not be possible to fill that position at short notice should your child not attend.
                </p>
                <p>
                  Early drop-offs will not be accepted without prior arrangement, as this is normally a limited service due to OFSTED number restrictions.
                </p>
                <p>
                  Late drop-off does not constitute late collection.
                </p>
                <p className="font-bold text-slate-900">
                  Please remember that late collection is very distressing for the child. After 6:00 pm, I am not insured for your child to be on the premises.
                </p>
                <p className="font-bold underline">
                  Parents should come and collect their child/ children 5 minutes before their pick-up time.
                </p>
                <p>
                  Please inform me by telephone call at least 30 minutes beforehand, or at the earliest opportunity, if you expect to be late or if your child will not be attending for any reason.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 7
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 7 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Late Collection Breach and Terms */}
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900">
                  Repeated late collection will be considered a breach of contract. The following procedures will be implemented in all late collections.
                </p>
                <p>
                  A standard late pickup fee of £5.00 will be charged during the first 10 minutes after your scheduled pickup time. An additional £5 will be charged for every 5 minutes thereafter.
                </p>
                <p className="font-bold">
                  The total late pickup charge should be paid by the next time you drop off your child.
                </p>
                <p>
                  Failure to pay any fine incurred may result in the withdrawal of the services provided until payment is made.
                </p>
                <p>
                  Parents are to pay a 50% retainer fee for term-time childcare. The fee confirms and reserves your child’s place for the following term.
                </p>
                <p>
                  I will give a minimum of FOUR (4) weeks’ notice of my holidays. Full payment will be required when I am on holiday.
                </p>
                <p>
                  Please do not hesitate to raise any concerns or issues you may have while your child or children are in my care. I am happy to discuss any concerns with you at any time, preferably during pick-ups.
                </p>

                {/* ── Automatic Late Pickup Fee Scale ── */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] block mb-2">
                    Late Pickup Fee Reference (Calculated per Contract Terms):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">1–10 minutes late</span>
                      <strong className="text-slate-900 text-sm">£5.00</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">11–15 minutes late</span>
                      <strong className="text-slate-900 text-sm">£10.00</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">16–20 minutes late</span>
                      <strong className="text-slate-900 text-sm">£15.00</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">21–25 minutes late</span>
                      <strong className="text-slate-900 text-sm">£20.00</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">26–30 minutes late</span>
                      <strong className="text-slate-900 text-sm">£25.00</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Termination / Amendment of Contract */}
              <div className="pt-2 space-y-2 text-xs text-slate-700 leading-relaxed">
                <h3 className="font-bold text-slate-900 underline text-sm">TERMINATION/ AMENDMENT OF CONTRACT</h3>
                <p>
                  Four (4) full weeks’ notice, starting the following Monday or later, is required by either party to terminate or amend this agreement. This contract may be terminated without notice if the child’s behaviour becomes such that the safety and well-being of other children in my care are threatened by the parent(s) / guardian(s) or the child’s behaviour.
                </p>
                <p>
                  You can cancel this agreement within 14 days of signing the form. After that, a minimum charge of 4 weeks' contracted cost will apply.
                </p>
              </div>

              {/* Bringing Things */}
              <div className="space-y-1 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 underline">Bringing Things</h3>
                <p>Children are allowed to bring only one personal comfort toy during the settling-in period</p>
              </div>

              {/* Health & Safety */}
              <div className="space-y-1 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 underline">Health & Safety</h3>
                <p>Buggies and pushchairs can be folded and stored in the shed, but they are left at the owner’s risk.</p>
                <p>Bikes and scooters can be left, but at your own risk.</p>
              </div>

              {/* Agreement review clause */}
              <div className="space-y-1 text-xs text-slate-800 font-semibold bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <p>This Agreement is subject to review at the start of every calendar year.</p>
                <p className="italic text-slate-600">(This agreement is valid until it is end-dated, or a new one is signed.)</p>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Parent Signature Box */}
                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Parent / Guardian Signature <span className="sk-required">*</span>
                      </span>
                      {hasSignature && (
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          <RotateCcw size={12} /> Clear
                        </button>
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={380}
                        height={130}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[130px] touch-none cursor-crosshair"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Sign in the box above using your mouse or finger/stylus.</p>
                    {errors.parentSignature && (
                      <p className="text-xs text-red-500">{errors.parentSignature}</p>
                    )}

                    <div className="space-y-2 pt-2">
                      <div>
                        <label className="sk-label">
                          Name: <span className="sk-required">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.page7.parentName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              page7: { ...formData.page7, parentName: e.target.value },
                            })
                          }
                          placeholder="Print full name"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                        {errors.parentName && (
                          <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>
                        )}
                      </div>

                      <div>
                        <label className="sk-label">Date:</label>
                        <input
                          type="date"
                          value={formData.page7.parentDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              page7: { ...formData.page7, parentDate: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                      </div>

                      <div className="pt-1 text-xs font-bold text-slate-800">
                        Parent/ Guardian
                      </div>
                    </div>
                  </div>

                  {/* Childminder Signature Box */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-300 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      Childminder Counter-Signature
                    </span>

                    <div className="bg-white rounded-xl border border-slate-300 p-4 h-[130px] flex flex-col justify-center items-center text-center">
                      <div className="text-2xl font-serif italic text-blue-950 font-bold tracking-wide">
                        Avril Cole
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Verified Childminder Signature</div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Name:</span> Avril Cole
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Date:</span> {formData.page7.childminderDate}
                      </div>
                      <div className="pt-1 font-bold text-slate-800">
                        Childminder
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 italic pt-2">
                  Please note that the Parent/Guardian signing above is responsible for paying fees.
                </p>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Page Navigation & Actions (Skallywags Style) ─────────────── */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {currentPage > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="sk-btn-secondary"
              >
                <ChevronLeft size={16} /> Previous Page
              </button>
            ) : (
              <div />
            )}

            <div className="text-xs font-bold text-slate-500">
              Page {currentPage} of 7
            </div>

            {currentPage < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="sk-btn-primary"
              >
                Next Page <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="sk-btn-primary disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </SectionWrapper>
    </main>
  )
}
