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
    childRaceEthnicity: '',
    religion: '',
    receivingSocialServices: '',
    socialWorkerDetails: '',
    specialNeedsOrDisabilities: '',
    dietaryNeeds: '',
    previousChildcare: '',
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
    gpName: '',
    gpAddress: '',
    gpNameAddress: '',
    gpPhone: '',
    healthVisitorName: '',
    immunisationsUpToDate: '',
    dentalTreatment: '',
    medicalNeedsDetails: '',
    allergiesDetails: '',
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
    specialDietaryRequirements: '',
  },
  page6: {
    emergencyHospitalTreatment: false,
    localOutings: false,
    photosVideosLearningRecord: false,
    transportInVehicle: false,
    transitionRecords: false,
    photosArtworkSetting: '',
    photosWebsite: '',
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
  'Page 1: Child Details, Parents & Emergency Contact 1',
  'Page 2: Emergency Contacts, Funded Entitlements & Fees',
  'Page 3: Sessions & Hours Schedules',
  'Page 4: Contract Duration & Terms',
  'Page 5: Medical Information, Consent & Sickness',
  'Page 6: Collection, Declarations & Signatures',
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
    if (currentPage !== 6) return
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

    if (page === 6) {
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
      if (currentPage < 6) {
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
    if (!validatePage(6)) return

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
    <main className="min-h-screen bg-[var(--color-neutral-50)] pb-20">
      {/* ── Page Header Banner ────────────────────────────────────────────── */}
      <section className="bg-[var(--color-primary-900)] text-white pt-28 md:pt-32 pb-10 px-4 border-b border-[var(--color-primary-800)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute -top-24 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(30, 86, 208, 0.25) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="pb-6 border-b border-white/10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-[var(--font-family-heading)] text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Divine Heritage Childcare Application Form
            </h1>
          </div>

          {/* Page Tabs Indicator */}
          <div className="pt-6">
            <div className="flex items-center justify-between text-xs text-white/90 mb-2.5 font-medium">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent-500)] text-white text-[11px] font-bold inline-flex items-center justify-center shadow-xs">
                  {currentPage}
                </span>
                <span>{PAGE_TITLES[currentPage - 1]}</span>
              </span>
              <span className="text-white/75 font-medium">Step {currentPage} of 6</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    if (pageNum <= currentPage || validatePage(currentPage)) {
                      setCurrentPage(pageNum)
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    pageNum === currentPage
                      ? 'bg-[var(--color-accent-400)] ring-2 ring-[var(--color-accent-300)]/50 shadow-xs'
                      : pageNum < currentPage
                      ? 'bg-emerald-400'
                      : 'bg-white/20 hover:bg-white/35'
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
              <div className="border-b-2 border-slate-800 pb-2">
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Details of Parental responsibility, legal contact, & residence arrangements:
                </h2>
              </div>

              {/* Child Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full name of Child: <span className="text-red-500">*</span>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  {errors.childFullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.childFullName}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Date of Birth: <span className="text-red-500">*</span>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  {errors.childDob && (
                    <p className="text-xs text-red-500 mt-1">{errors.childDob}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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

                {/* Second Line: Child's Race & Ethnic background, Religion */}
                <div className="md:col-span-7">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Child's Race & Ethnic background:
                  </label>
                  <input
                    type="text"
                    value={formData.page1.childRaceEthnicity || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        page1: { ...prev.page1, childRaceEthnicity: val },
                        page4: { ...prev.page4, childRaceEthnicity: val },
                      }))
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Religion:
                  </label>
                  <input
                    type="text"
                    value={formData.page1.religion || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        page1: { ...prev.page1, religion: val },
                        page4: { ...prev.page4, religion: val },
                      }))
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                {/* Social Services */}
                <div className="md:col-span-12 space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="block text-xs font-bold text-slate-800">
                      Is your child currently receiving support from or working with social services?
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="receivingSocialServices"
                          value="Yes"
                          checked={formData.page1.receivingSocialServices === 'Yes'}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              page1: { ...prev.page1, receivingSocialServices: 'Yes' },
                              page5: { ...prev.page5, childInCareOrLookedAfter: 'Yes' },
                            }))
                          }
                        />
                        <span>Yes □</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="receivingSocialServices"
                          value="No"
                          checked={formData.page1.receivingSocialServices === 'No'}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              page1: { ...prev.page1, receivingSocialServices: 'No' },
                              page5: { ...prev.page5, childInCareOrLookedAfter: 'No' },
                            }))
                          }
                        />
                        <span>No □</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 mb-1">
                      If yes, please provide the name of social worker or team (optional):
                    </label>
                    <input
                      type="text"
                      value={formData.page1.socialWorkerDetails || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          page1: { ...prev.page1, socialWorkerDetails: val },
                          page5: { ...prev.page5, lookedAfterDetails: val },
                        }))
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>

                {/* Special Educational Needs or Disabilities */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Does your child have any special Educational needs or Disabilities? ( If yes, please share  details below)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.page1.specialNeedsOrDisabilities || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        page1: { ...prev.page1, specialNeedsOrDisabilities: val },
                        page5: { ...prev.page5, medicalNeedsDetails: val },
                      }))
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                {/* Dietary needs */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Any dietary needs for food or drinks?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.page1.dietaryNeeds || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        page1: { ...prev.page1, dietaryNeeds: val },
                        page5: { ...prev.page5, specialDietaryRequirements: val },
                      }))
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                {/* Child's Previous Childcare */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Child's Previous Childcare
                  </label>
                  <input
                    type="text"
                    value={formData.page1.previousChildcare || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        page1: { ...prev.page1, previousChildcare: val },
                        page4: { ...prev.page4, previousChildcare: val },
                      }))
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
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
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Name of Parent/ Carer/ Guardian 1: <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                    {errors.parent1Name && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Home Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent1Address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Address: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Phone Mobile: <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                    {errors.parent1Mobile && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email: <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                    {errors.parent1Email && (
                      <p className="text-xs text-red-500 mt-1">{errors.parent1Email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Profession:</label>
                    <input
                      type="text"
                      value={formData.page1.parent1Profession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1Profession: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Work / College Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent1WorkAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1WorkAddress: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Work Phone:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent1WorkPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent1WorkPhone: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>

                {/* Parent 2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 p-2 rounded-lg">
                    Parent / Carer / Guardian 2 (Optional)
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Home Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent2Address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Address: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Phone Mobile:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent2Mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Mobile: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Email:</label>
                    <input
                      type="email"
                      value={formData.page1.parent2Email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Email: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Profession:</label>
                    <input
                      type="text"
                      value={formData.page1.parent2Profession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2Profession: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Work / College Address:</label>
                    <textarea
                      rows={2}
                      value={formData.page1.parent2WorkAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2WorkAddress: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Work Phone:</label>
                    <input
                      type="tel"
                      value={formData.page1.parent2WorkPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page1: { ...formData.page1, parent2WorkPhone: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>
              </div>

              {/* Who will bring/collect */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Name: <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                    {errors.emergency1Name && (
                      <p className="text-xs text-red-500 mt-1">{errors.emergency1Name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Contact no: <span className="text-red-500">*</span>
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                    {errors.emergency1ContactNo && (
                      <p className="text-xs text-red-500 mt-1">{errors.emergency1ContactNo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Relationship:</label>
                    <input
                      type="text"
                      value={formData.emergencyContacts[0].relationship}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts] as [any, any, any, any]
                        updated[0].relationship = e.target.value
                        setFormData({ ...formData, emergencyContacts: updated })
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                <div className="border-b-2 border-slate-800 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Emergency Contact(s) (Continued)
                  </h2>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
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
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Contact no:</label>
                        <input
                          type="tel"
                          value={formData.emergencyContacts[idx].contactNo}
                          onChange={(e) => {
                            const updated = [...formData.emergencyContacts] as [any, any, any, any]
                            updated[idx].contactNo = e.target.value
                            setFormData({ ...formData, emergencyContacts: updated })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Relationship:</label>
                        <input
                          type="text"
                          value={formData.emergencyContacts[idx].relationship}
                          onChange={(e) => {
                            const updated = [...formData.emergencyContacts] as [any, any, any, any]
                            updated[idx].relationship = e.target.value
                            setFormData({ ...formData, emergencyContacts: updated })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funded Hours / Free Entitlements */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 underline">
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
                      className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                      className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                      className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                      className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                      className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
              {/* Payment Notes */}
              <div className="text-xs text-slate-700 leading-relaxed">
                <p>
                  Fees are payable in advance on a weekly, 4-weekly, or monthly basis. Fees can be paid by cash, tax-free childcare voucher, Universal Credit, or online bank transfer.
                </p>
              </div>

              {/* Session & Start date required */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 underline">
                    Session & Start date required
                  </h2>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <div><strong>Full Day:</strong> 8-6 pm</div>
                    <div className="font-semibold text-slate-800">Friday closes at 5 PM</div>
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
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
                          { key: 'rowFullDay', label: 'Full Day 8-6 pm' },
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

                <div className="text-xs font-bold text-amber-900 bg-amber-50/70 px-3.5 py-2.5 rounded-xl border border-amber-200/80 space-y-1">
                  <div>Full Day 8-6 pm</div>
                  <div>Please note that I only Accept children for a minimum of 2 full days and 3 part time days</div>
                </div>
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
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        !isBabyRate
                          ? 'bg-[var(--color-primary-600)] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Standard (£12/hr, £70/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualBabyRate(true)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        isBabyRate
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                <div className="border-b-2 border-slate-800 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Contract Duration:
                  </h2>
                </div>

                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Start of contract:</label>
                  <input
                    type="date"
                    value={formData.page4.contractStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        page4: { ...formData.page4, contractStartDate: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                </div>

                <p className="text-xs font-bold text-slate-800 pt-1">
                  A minimum of four weeks’ notice is required to end the contract.
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
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 5
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 5 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-6 animate-fadeIn">
              {/* Medical Information */}
              <div className="space-y-4 text-xs">
                <div className="border-b-2 border-slate-800 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Medical Information
                  </h2>
                </div>

                {/* General Practitioner Name & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      General Practitioner's Name:
                    </label>
                    <input
                      type="text"
                      placeholder="Doctor's name or surgery name"
                      value={formData.page5.gpName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, gpName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      General Practitioner's Address:
                    </label>
                    <input
                      type="text"
                      placeholder="Full surgery address"
                      value={formData.page5.gpAddress || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, gpAddress: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Phone no:
                    </label>
                    <input
                      type="tel"
                      placeholder="Surgery phone number"
                      value={formData.page5.gpPhone || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, gpPhone: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Health visitor name:
                    </label>
                    <input
                      type="text"
                      placeholder="Health visitor name"
                      value={formData.page5.healthVisitorName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, healthVisitorName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>

                {/* Immunisations & Dental */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      Immunisations: Are they up to date?
                    </label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="immunisationsUpToDate"
                          value="Yes"
                          checked={formData.page5.immunisationsUpToDate === 'Yes'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page5: { ...formData.page5, immunisationsUpToDate: 'Yes' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="immunisationsUpToDate"
                          value="No"
                          checked={formData.page5.immunisationsUpToDate === 'No'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page5: { ...formData.page5, immunisationsUpToDate: 'No' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Dental treatment?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Regular checkups, dentist name, or none"
                      value={formData.page5.dentalTreatment || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page5: { ...formData.page5, dentalTreatment: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                  </div>
                </div>

                {/* Childhood illnesses / serious conditions */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    Any childhood illneses/ serious condition? If yes, please give details below.
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details if yes, or leave blank if none"
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

                {/* Allergies / health conditions */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Any Allergies/ health conditions, e.g asthma, eczema, inhaler/ epipen, penicillin, food, plaster, etc
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details of allergies, conditions, medications, or leave blank if none"
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
              </div>

              {/* Consent - Please tick to give permission */}
              <div className="space-y-4 pt-4 border-t-2 border-slate-800">
                <div className="pb-1">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Consent - Please tick to give permission
                  </h2>
                </div>

                <div className="space-y-3 text-xs text-slate-800">
                  {/* Photo & Artwork within setting */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-semibold text-slate-900 block">
                      I give/do not permit my child's photos and artwork to be used and displayed within the setting
                    </span>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="photosArtworkSetting"
                          value="give"
                          checked={formData.page6.photosArtworkSetting === 'give'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page6: { ...formData.page6, photosArtworkSetting: 'give' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>I give permission</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="photosArtworkSetting"
                          value="do_not_permit"
                          checked={formData.page6.photosArtworkSetting === 'do_not_permit'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page6: { ...formData.page6, photosArtworkSetting: 'do_not_permit' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>I do not permit</span>
                      </label>
                    </div>
                  </div>

                  {/* Photo on website */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-semibold text-slate-900 block">
                      I give/ do not permit photos/work featuring my child to be included on the website
                    </span>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="photosWebsite"
                          value="give"
                          checked={formData.page6.photosWebsite === 'give'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page6: { ...formData.page6, photosWebsite: 'give' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>I give permission</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="photosWebsite"
                          value="do_not_permit"
                          checked={formData.page6.photosWebsite === 'do_not_permit'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              page6: { ...formData.page6, photosWebsite: 'do_not_permit' },
                            })
                          }
                          className="w-4 h-4 text-[var(--color-primary-600)]"
                        />
                        <span>I do not permit</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sickness Policy */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-3">
                <div className="pb-1">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Sickness
                  </h2>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <p>
                    Divine Heritage may contact you if your child is unwell (e.g., persistent coughing or sneezing) to prevent spreading illness to other children and staff.
                  </p>
                  <p>
                    Do not send your child if they were given antibiotics or Calpol before the session.
                  </p>
                  <p>
                    Vomiting/Diarrhoea: Children must stay home for 48 hours after their last episode and until completely recovered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 6 (MERGED: COLLECTION & SIGNATURES)
          ══════════════════════════════════════════════════════════════════ */}
          {currentPage === 6 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 animate-fadeIn">
              {/* Collection Section */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-800 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Collection
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                  <p>
                    Full payment is required in advance for all contracted hours. No refunds or discounts are given for early collections, or absences.
                  </p>
                  <p>
                    Early drop offs require prior arrangement due to strict staff to child ratio limits.
                  </p>
                  <p>
                    Arrive 5 minutes before your scheduled pick up time. Repeated late pick ups constitute a breach of contract.
                  </p>
                  <p className="font-semibold text-slate-900">
                    A late collection fee will incur a fine of £3.00 per minute.
                  </p>
                  <p>
                    Fines are payable and failure to pay will result in withdrawal of service until payment is made.
                  </p>
                  <p>
                    Call at least 30 minutes in advance (or as soon as possible) if your child will be late or absent.
                  </p>
                </div>
              </div>

              {/* Declarations & Signatures Section */}
              <div className="pt-4 border-t-2 border-slate-800 space-y-6">
                <div className="border-b border-slate-200 pb-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Declarations & Signatures
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Parent Signature Box */}
                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Parent / Guardian Signature <span className="text-red-500">*</span>
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
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Name: <span className="text-red-500">*</span>
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
                        <label className="block text-xs font-bold text-slate-800 mb-1">Date:</label>
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

          {/* ── Page Navigation & Actions ─────────────────────────────────── */}
          <div className="flex items-center justify-between pt-4">
            {currentPage > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} /> Previous Page
              </button>
            ) : (
              <div />
            )}

            <div className="text-xs font-semibold text-slate-500">
              Page {currentPage} of 6
            </div>

            {currentPage < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Next Page <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
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
