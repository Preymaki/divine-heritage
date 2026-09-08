/**
 * AdminApplications — /admin/applications
 *
 * CMS dashboard for managing submitted childcare applications.
 * Faithfully displays the exact 7-page Divine Heritage Application Form schema
 * without any AI-added content.
 */

import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  Search,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  X,
} from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'
import {
  subscribeToApplications,
  updateApplicationStatus,
  deleteApplication,
  downloadApplicationPDF,
} from '@services/applications'
import type { ApplicationRecord, ApplicationStatus } from '@appTypes/application'
import {
  calculateWeeklySchedule,
  calculateFundedHours,
  isChildUnder8Months,
} from '@utils/applicationFees'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  contacted: 'Contacted',
  accepted: 'Accepted',
  declined: 'Declined',
  archived: 'Archived',
}

const STATUS_PILL: Record<ApplicationStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
  under_review: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
  contacted: 'bg-purple-50 text-purple-700 border border-purple-200 font-medium',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
  declined: 'bg-rose-50 text-rose-700 border border-rose-200 font-medium',
  archived: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
}

function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return '44' + digits.slice(1)
  }
  return digits
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null)
  const [activeModalPage, setActiveModalPage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

  useEffect(() => {
    const unsub = subscribeToApplications(
      (data) => {
        setApplications(data)
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Filtered list
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false
      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase()
      const childName = (app.page1?.childFullName || app.child?.fullName || '').toLowerCase()
      const parentName = (app.page1?.parent1Name || app.parent1?.fullName || '').toLowerCase()
      const parentEmail = (app.page1?.parent1Email || app.parent1?.email || '').toLowerCase()
      const appId = (app.applicationId || app.id || '').toLowerCase()

      return (
        childName.includes(q) ||
        parentName.includes(q) ||
        parentEmail.includes(q) ||
        appId.includes(q)
      )
    })
  }, [applications, statusFilter, searchQuery])

  // Count stats
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: applications.length }
    for (const app of applications) {
      map[app.status] = (map[app.status] || 0) + 1
    }
    return map
  }, [applications])

  async function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    await updateApplicationStatus(id, newStatus)
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus })
    }
  }

  async function handleDelete(id: string, name: string) {
    if (window.confirm(`Are you sure you want to delete the application for ${name}? This action cannot be undone.`)) {
      await deleteApplication(id)
      if (selectedApp?.id === id) setSelectedApp(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Childcare Applications"
        subtitle="Review submitted online applications, inspect full registration details, and download completed PDF copies."
      />

      {/* ── Status Tabs & Search ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'under_review', 'contacted', 'accepted', 'declined', 'archived'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--color-primary-600)] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{st === 'all' ? 'All Applications' : STATUS_LABELS[st]}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {counts[st] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by child, parent, ref..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] text-slate-800"
          />
        </div>
      </div>

      {/* ── Content Table / Cards ────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-3 border-[var(--color-primary-600)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications found"
          description={
            searchQuery
              ? 'No applications match your search query.'
              : statusFilter !== 'all'
              ? `There are currently no applications marked as ${STATUS_LABELS[statusFilter]}.`
              : 'No childcare applications have been submitted yet. Submitted applications will appear here automatically.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const childName = app.page1?.childFullName || app.child?.fullName || 'Applicant Child'
            const childDob = app.page1?.childDob || app.child?.dob || '—'
            const childGender = app.page1?.childGender || app.child?.sex || '—'
            const parentName = app.page1?.parent1Name || app.parent1?.fullName || 'Parent / Guardian'
            const phone = app.page1?.parent1Mobile || app.parent1?.mobile || ''
            const email = app.page1?.parent1Email || app.parent1?.email || ''
            const startDate = app.page3?.requiredStartDate || app.page4?.contractStartDate || app.sessions?.requiredStartDate || '—'
            const isBaby = isChildUnder8Months(
              app.page1?.childDob || app.child?.dob,
              app.page3?.requiredStartDate || app.sessions?.requiredStartDate
            )
            const sched = calculateWeeklySchedule(app.page3?.contractedHours, isBaby)
            const hours =
              sched.totalHours > 0
                ? sched.totalHours
                : app.page3?.contractedHours?.totalHoursPerWeek ||
                  app.contractedSchedule?.totalContractedHours ||
                  0
            const cost =
              sched.grossCost > 0
                ? sched.grossCostStr
                : app.page3?.contractedHours?.totalCostPerWeek ||
                  app.contractedSchedule?.totalWeeklyCost ||
                  '—'
            const ref = app.applicationId || app.id
            const dateStr = new Date(app.submittedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[var(--shadow-soft)] hover:border-[var(--color-primary-300)] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {ref}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${STATUS_PILL[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                    <span className="text-xs text-slate-400">• Submitted {dateStr}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-[var(--font-family-heading)]">
                    {childName}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (DOB: {childDob}, Gender: {childGender})
                    </span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>
                      Parent 1: <strong className="text-slate-800">{parentName}</strong>
                    </span>
                    {phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                      </span>
                    )}
                    {email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                      Target Start: <strong>{startDate}</strong>
                    </span>
                    <span className="bg-[var(--color-primary-50)] text-[var(--color-primary-800)] px-2 py-0.5 rounded-md font-semibold">
                      {hours} hrs/week
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                      {typeof cost === 'number' ? `£${cost.toFixed(2)}/wk` : cost}
                    </span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                  >
                    <option value="new">Mark New</option>
                    <option value="under_review">Mark Under Review</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="accepted">Mark Accepted</option>
                    <option value="declined">Mark Declined</option>
                    <option value="archived">Mark Archived</option>
                  </select>

                  {/* View Full Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(app)
                      setActiveModalPage(1)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Eye size={14} />
                    View Form
                  </button>

                  {/* Download PDF Button */}
                  <button
                    type="button"
                    onClick={() => downloadApplicationPDF(app)}
                    title="Download Official PDF"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>

                  {/* WhatsApp Link if phone present */}
                  {phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Message on WhatsApp"
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                    >
                      <MessageCircle size={15} />
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(app.id, childName)}
                    title="Delete Application"
                    className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── DETAIL MODAL (EXACT 7-PAGE DOCUMENT VIEWER) ───────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[var(--color-primary-900)] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono bg-white/15 px-2 py-0.5 rounded text-slate-200">
                  Ref: {selectedApp.applicationId || selectedApp.id}
                </span>
                <h2 className="text-lg md:text-xl font-bold font-[var(--font-family-heading)] mt-1 text-white">
                  {selectedApp.page1?.childFullName || selectedApp.child?.fullName || 'Childcare Application'} — Official Form
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadApplicationPDF(selectedApp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  aria-label="Close application details"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Nav Tabs (Pages 1 to 7) */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto no-scrollbar text-xs">
              {[
                { page: 1, label: 'Page 1: Child & Parents' },
                { page: 2, label: 'Page 2: Funded Entitlements' },
                { page: 3, label: 'Page 3: Hours Schedule & Contract' },
                { page: 4, label: 'Page 4: Medical, Consent & Sickness' },
                { page: 5, label: 'Page 5: Collection & Signatures' },
              ].map((tab) => (
                <button
                  key={tab.page}
                  type="button"
                  onClick={() => setActiveModalPage(tab.page as any)}
                  className={`shrink-0 px-3.5 sm:px-4 py-3 font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                    activeModalPage === tab.page
                      ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-white font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* PAGE 1 */}
              {activeModalPage === 1 && (
                <div className="space-y-6">
                  {/* Childminder Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Childminder: Avril Cole
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                      <div><strong>Address:</strong> 5 Pitman Building, Freda Street, London. SE16 4BW</div>
                      <div><strong>Mobile:</strong> 07939303144</div>
                      <div className="col-span-2"><strong>Email:</strong> divineheritagechildcare@gmail.com</div>
                    </div>
                  </div>

                  {/* Details of Parental responsibility, legal contact, & residence arrangements */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold uppercase tracking-wider text-[var(--color-primary-800)] border-b pb-2">
                      Details of Parental responsibility, legal contact, & residence arrangements
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><span className="text-slate-400 block">Full name of Child:</span><strong>{selectedApp.page1?.childFullName || selectedApp.child?.fullName || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Date of Birth:</span><strong>{selectedApp.page1?.childDob || selectedApp.child?.dob || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Gender:</span><strong>{selectedApp.page1?.childGender || selectedApp.child?.sex || '—'}</strong></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                      <div><span className="text-slate-400 block">Child's Race & Ethnic Background:</span><strong>{selectedApp.page1?.childRaceEthnicity || selectedApp.page4?.childRaceEthnicity || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Religion:</span><strong>{selectedApp.page1?.religion || selectedApp.page4?.religion || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Social Services Support:</span><strong>{selectedApp.page1?.receivingSocialServices || selectedApp.page5?.childInCareOrLookedAfter || '—'}{selectedApp.page1?.socialWorkerDetails ? ` (${selectedApp.page1.socialWorkerDetails})` : selectedApp.page5?.lookedAfterDetails ? ` (${selectedApp.page5.lookedAfterDetails})` : ''}</strong></div>
                      <div><span className="text-slate-400 block">Special Needs / Disabilities:</span><strong>{selectedApp.page1?.specialNeedsOrDisabilities || selectedApp.page5?.medicalNeedsDetails || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Dietary Needs:</span><strong>{selectedApp.page1?.dietaryNeeds || selectedApp.page5?.specialDietaryRequirements || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Child's Previous Childcare:</span><strong>{selectedApp.page1?.previousChildcare || selectedApp.page4?.previousChildcare || '—'}</strong></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200">
                      {/* Parent 1 */}
                      <div className="space-y-2">
                        <span className="font-bold text-slate-800 block underline">Parent / Carer / Guardian 1:</span>
                        <div><span className="text-slate-400 block">Name:</span><strong>{selectedApp.page1?.parent1Name || selectedApp.parent1?.fullName || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Home Address:</span><strong>{selectedApp.page1?.parent1Address || selectedApp.parent1?.homeAddress || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Phone Mobile:</span><strong>{selectedApp.page1?.parent1Mobile || selectedApp.parent1?.mobile || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Email:</span><strong>{selectedApp.page1?.parent1Email || selectedApp.parent1?.email || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Profession:</span><strong>{selectedApp.page1?.parent1Profession || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Work / College Address:</span><strong>{selectedApp.page1?.parent1WorkAddress || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Work Phone:</span><strong>{selectedApp.page1?.parent1WorkPhone || '—'}</strong></div>
                      </div>

                      {/* Parent 2 */}
                      <div className="space-y-2">
                        <span className="font-bold text-slate-800 block underline">Parent / Carer / Guardian 2:</span>
                        <div><span className="text-slate-400 block">Name:</span><strong>{selectedApp.page1?.parent2Name || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Home Address:</span><strong>{selectedApp.page1?.parent2Address || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Phone Mobile:</span><strong>{selectedApp.page1?.parent2Mobile || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Email:</span><strong>{selectedApp.page1?.parent2Email || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Profession:</span><strong>{selectedApp.page1?.parent2Profession || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Work / College Address:</span><strong>{selectedApp.page1?.parent2WorkAddress || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Work Phone:</span><strong>{selectedApp.page1?.parent2WorkPhone || '—'}</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                      <div><span className="text-slate-400 block">Who will bring/collect the child:</span><strong>{selectedApp.page1?.whoWillBringCollect || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Contact Details:</span><strong>{selectedApp.page1?.contactDetails || '—'}</strong></div>
                    </div>
                  </div>

                  {/* Emergency Contact 1 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Emergency Contact 1
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><span className="text-slate-400 block">Name:</span><strong>{selectedApp.emergencyContacts?.[0]?.name || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Contact no:</span><strong>{selectedApp.emergencyContacts?.[0]?.contactNo || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Relationship:</span><strong>{selectedApp.emergencyContacts?.[0]?.relationship || '—'}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2 */}
              {activeModalPage === 2 && (
                <div className="space-y-6">
                  {/* Emergency Contacts 2, 3, 4 */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2 border-b pb-2">
                      Emergency Contacts (2, 3, 4)
                    </h4>
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2 bg-white rounded-lg border border-slate-200">
                        <div><span className="text-slate-400 block">{idx + 1}. Name:</span><strong>{selectedApp.emergencyContacts?.[idx]?.name || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Contact no:</span><strong>{selectedApp.emergencyContacts?.[idx]?.contactNo || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Relationship:</span><strong>{selectedApp.emergencyContacts?.[idx]?.relationship || '—'}</strong></div>
                      </div>
                    ))}
                  </div>

                  {/* Funded Hours / Free Entitlements */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-[var(--color-primary-800)] border-b pb-2">
                      Funded Hours / Free Entitlements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><span className="text-slate-400 block">15hrs universal entitlement for 3 & 4-year-olds:</span><strong>{selectedApp.page2?.universal15Hrs || '—'}</strong></div>
                      <div><span className="text-slate-400 block">15hrs working parent (9-23m) Code:</span><strong>{selectedApp.page2?.workingParent15HrsUnder2Code || '—'}</strong></div>
                      <div><span className="text-slate-400 block">15hrs working parent (2yo) Code:</span><strong>{selectedApp.page2?.workingParent15Hrs2yoCode || '—'}</strong></div>
                      <div><span className="text-slate-400 block">30 hrs working parent (3 & 4yo) Code:</span><strong>{selectedApp.page2?.workingParent30HrsCode || '—'}</strong></div>
                      <div><span className="text-slate-400 block">National Insurance no:</span><strong>{selectedApp.page2?.nationalInsuranceNo || '—'}</strong></div>
                      <div><span className="text-slate-400 block">Parent claiming DOB:</span><strong>{selectedApp.page2?.parentClaimingDob || '—'}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3 */}
              {activeModalPage === 3 && (
                <div className="space-y-6">
                  {/* Session Requirements */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Start of contract
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block">Start of contract:</span>
                        <strong className="text-sm text-slate-900">
                          {selectedApp.page3?.requiredStartDate || selectedApp.page4?.contractStartDate || selectedApp.sessions?.requiredStartDate || '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Notice Requirement:</span>
                        <strong className="text-slate-700">A minimum of four weeks’ notice is required to end the contract.</strong>
                      </div>
                    </div>
                  </div>

                  {/* Early Years Funded Hours */}
                  {selectedApp.page3?.fundedSchedule && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-bold uppercase tracking-wider text-slate-800">
                        Early Years Funded Hours
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border border-slate-300 bg-white rounded-lg">
                          <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                            <tr>
                              <th className="p-2">Time</th>
                              <th className="p-2 text-center">Mon</th>
                              <th className="p-2 text-center">Tue</th>
                              <th className="p-2 text-center">Wed</th>
                              <th className="p-2 text-center">Thu</th>
                              <th className="p-2 text-center">Fri</th>
                              <th className="p-2 text-center">Total Hrs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {[
                              { key: 'row8to1', label: '8 – 1pm' },
                              { key: 'row12to5', label: '12 - 12:45 - 5 - 5:45 PM' },
                              { key: 'rowFullDay', label: 'Full Day 8-6 pm' },
                            ].map(({ key, label }) => {
                              const row = (selectedApp.page3?.fundedSchedule as any)?.[key]
                              return (
                                <tr key={key}>
                                  <td className="p-2 font-medium">{label}</td>
                                  <td className="p-2 text-center">{row?.monday ? '✓' : '—'}</td>
                                  <td className="p-2 text-center">{row?.tuesday ? '✓' : '—'}</td>
                                  <td className="p-2 text-center">{row?.wednesday ? '✓' : '—'}</td>
                                  <td className="p-2 text-center">{row?.thursday ? '✓' : '—'}</td>
                                  <td className="p-2 text-center">{row?.friday ? '✓' : '—'}</td>
                                  <td className="p-2 text-center font-bold">{row?.totalHrs || '—'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Contracted Hours */}
                  {(() => {
                    const modalIsBaby = isChildUnder8Months(
                      selectedApp.page1?.childDob || selectedApp.child?.dob,
                      selectedApp.page3?.requiredStartDate || selectedApp.sessions?.requiredStartDate
                    )
                    const modalFees = calculateWeeklySchedule(selectedApp.page3?.contractedHours, modalIsBaby)
                    const modalFunded = calculateFundedHours(selectedApp.page3?.fundedSchedule)

                    return (
                      <div className="space-y-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="font-bold uppercase tracking-wider text-slate-800">
                              Contracted Hours
                            </h4>
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white border border-slate-200 text-slate-700">
                              Rate applied: {modalIsBaby ? 'Baby <8m (£14/hr, £80/day)' : 'Standard (£12/hr, £70/day)'}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border border-slate-300 bg-white rounded-lg">
                              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                                <tr>
                                  <th className="p-2">Day</th>
                                  <th className="p-2">Time From</th>
                                  <th className="p-2">Time To</th>
                                  <th className="p-2">Total Hours</th>
                                  <th className="p-2">Rate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => {
                                  const d = selectedApp.page3?.contractedHours?.[day]
                                  return (
                                    <tr key={day}>
                                      <td className="p-2 font-bold capitalize">{day}</td>
                                      <td className="p-2">{d?.timeFrom || '—'}</td>
                                      <td className="p-2">{d?.timeTo || '—'}</td>
                                      <td className="p-2">{d?.totalHours || '—'}</td>
                                      <td className="p-2">{d?.rate || '—'}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                                <tr>
                                  <td colSpan={3} className="p-2">Total hours / cost per week:</td>
                                  <td className="p-2">
                                    {modalFees.totalHours > 0
                                      ? `${modalFees.totalHours} hrs`
                                      : selectedApp.page3?.contractedHours?.totalHoursPerWeek || selectedApp.contractedSchedule?.totalContractedHours || '—'}
                                  </td>
                                  <td className="p-2">
                                    {modalFees.grossCost > 0
                                      ? modalFees.grossCostStr
                                      : selectedApp.page3?.contractedHours?.totalCostPerWeek || selectedApp.contractedSchedule?.totalWeeklyCost || '—'}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* Automatic Fee & Advance Payment Schedule */}
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Automatic Fee & Advance Payment Schedule
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Calculated automatically based on the Application Form fee rules.
                              </p>
                            </div>
                            {modalFees.isFullTimeDiscount && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Full-time discount applied (£330.00/wk)
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                              <span className="text-slate-500 block text-[11px]">Weekly Fee:</span>
                              <strong className="text-base text-slate-900 font-bold block mt-0.5">
                                {modalFees.grossCostStr || '£0.00'}
                              </strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {modalFees.totalHours} hrs / week
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                              <span className="text-slate-500 block text-[11px]">4-Weekly in advance:</span>
                              <strong className="text-base text-slate-900 font-bold block mt-0.5">
                                {modalFees.fourWeeklyCostStr || '£0.00'}
                              </strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                4 weeks contracted
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                              <span className="text-slate-500 block text-[11px]">Monthly in advance:</span>
                              <strong className="text-base text-slate-900 font-bold block mt-0.5">
                                {modalFees.monthlyCostStr || '£0.00'}
                              </strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Calendar month (52wks/12)
                              </span>
                            </div>
                          </div>

                          {/* Funded Hours Offset Display */}
                          {modalFunded.totalFundedHrs > 0 && (
                            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <strong>Early Years Entitlement:</strong> {modalFunded.totalFundedHrs} hrs/week funded.
                                {modalFees.totalHours > modalFunded.totalFundedHrs ? (
                                  <span> (Parent payable hours: {Math.round((modalFees.totalHours - modalFunded.totalFundedHrs) * 10) / 10} hrs beyond entitlement)</span>
                                ) : (
                                  <span> (All contracted hours covered within entitlement)</span>
                                )}
                              </div>
                              <div className="font-bold text-sm text-[var(--color-primary-900)]">
                                Net Weekly Fee: £
                                {Math.max(
                                  0,
                                  modalFees.totalHours > modalFunded.totalFundedHrs
                                    ? (modalFees.totalHours - modalFunded.totalFundedHrs) * (modalIsBaby ? 14 : 12)
                                    : 0
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* PAGE 4 */}
              {activeModalPage === 4 && (
                <div className="space-y-6">

                  {/* Medical Information */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b pb-2">
                      Medical Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block">Doctor's Name:</span>
                        <strong>{selectedApp.page5?.gpName || (selectedApp.page5?.gpNameAddress ? selectedApp.page5?.gpNameAddress.split('\n')[0] : '—')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Surgery Name and Address:</span>
                        <p className="bg-white p-2.5 rounded border border-slate-200">{selectedApp.page5?.gpAddress || selectedApp.page5?.gpNameAddress || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Phone no:</span>
                        <strong>{selectedApp.page5?.gpPhone || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Health visitor name and contact number:</span>
                        <strong>{selectedApp.page5?.healthVisitorName || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Immunisations up to date?:</span>
                        <strong>{selectedApp.page5?.immunisationsUpToDate || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dental treatment:</span>
                        <strong>{selectedApp.page5?.dentalTreatment || '—'}</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Any childhood illnesses/ serious condition:</span>
                      <p className="bg-white p-2.5 rounded border border-slate-200">{selectedApp.page5?.medicalNeedsDetails || 'None stated'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Any Allergies/ health conditions:</span>
                      <p className="bg-white p-2.5 rounded border border-slate-200">{selectedApp.page5?.allergiesDetails || 'None stated'}</p>
                    </div>
                  </div>

                  {/* Consent & Permissions */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-[var(--color-primary-800)] border-b pb-2">
                      Consent & Permissions:
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: "My child can be taken to the hospital for treatment in the event of an emergency", status: selectedApp.page6?.emergencyHospitalTreatment ? '✓ Granted' : '— Not ticked' },
                        { label: "My child can be taken on local outing trips", status: selectedApp.page6?.localOutings ? '✓ Granted' : '— Not ticked' },
                        { label: "My child to have photographs/ videos taken for the learning record", status: selectedApp.page6?.photosVideosLearningRecord ? '✓ Granted' : '— Not ticked' },
                        { label: "My child is to be transported by the childminder/setting in the vehicle used for this purpose", status: selectedApp.page6?.transportInVehicle ? '✓ Granted' : '— Not ticked' },
                        { label: "My child’s records were passed on to the next setting as part of transition arrangements", status: selectedApp.page6?.transitionRecords ? '✓ Granted' : '— Not ticked' },
                        { label: "Photos and artwork displayed within setting", status: selectedApp.page6?.photosArtworkSetting === 'give' ? '✓ I give permission' : selectedApp.page6?.photosArtworkSetting === 'do_not_permit' ? '✕ Do not permit' : '— Not stated' },
                        { label: "Photos/work included on website", status: selectedApp.page6?.photosWebsite === 'give' ? '✓ I give permission' : selectedApp.page6?.photosWebsite === 'do_not_permit' ? '✕ Do not permit' : '— Not stated' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                          <span className={item.status.startsWith('✓') ? 'text-emerald-600 font-bold' : item.status.startsWith('✕') ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {item.status}
                          </span>
                          <span className="text-slate-800">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sickness Policy Confirmation */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-slate-600">
                    <h4 className="font-bold text-slate-800">Sickness Policy Confirmation</h4>
                    <p>• Unwell contact policy (persistent coughing/sneezing)</p>
                    <p>• Antibiotics or Calpol policy before session</p>
                    <p>• 48-hour vomiting/diarrhoea rule until completely recovered</p>
                  </div>
                </div>
              )}

              {/* PAGE 5 (MERGED: COLLECTION & SIGNATURES) */}
              {activeModalPage === 5 && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-slate-700 text-xs">
                    <h4 className="font-bold text-slate-900 text-sm">Collection</h4>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Full payment is required in advance for all contracted hours. No refunds or discounts are given for early collections, or absences.</li>
                      <li>Early drop offs require prior arrangement due to strict staff to child ratio limits.</li>
                      <li>Arrive 5 minutes before your scheduled pick up time. Repeated late pick ups constitute a breach of contract.</li>
                      <li>A late collection fee will incur a fine of £3.00 per minute.</li>
                      <li>Fines are payable and failure to pay will result in withdrawal of service until payment is made.</li>
                      <li>Call at least 30 minutes in advance (or as soon as possible) if your child will be late or absent.</li>
                    </ul>
                  </div>

                  {/* Signatures */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold uppercase tracking-wider text-[var(--color-primary-800)] border-b pb-2">
                      Contract Signatures & Agreement
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Parent Signature */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <span className="font-bold text-slate-800 block">Parent / Guardian:</span>
                        {selectedApp.page7?.parentSignature ? (
                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <img
                              src={selectedApp.page7.parentSignature}
                              alt="Parent Signature"
                              className="max-h-24 mx-auto"
                            />
                          </div>
                        ) : (
                          <div className="h-24 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                            No digital signature image
                          </div>
                        )}
                        <div><span className="text-slate-400 block">Name:</span><strong>{selectedApp.page7?.parentName || selectedApp.page1?.parent1Name || '—'}</strong></div>
                        <div><span className="text-slate-400 block">Date:</span><strong>{selectedApp.page7?.parentDate || '—'}</strong></div>
                      </div>

                      {/* Childminder Signature */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <span className="font-bold text-slate-800 block">Childminder:</span>
                        <div className="h-24 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                          <span className="text-xl font-serif italic text-blue-950 font-bold">Avril Cole</span>
                          <span className="text-[10px] text-slate-400">Official Childminder Signature</span>
                        </div>
                        <div><span className="text-slate-400 block">Name:</span><strong>Avril Cole</strong></div>
                        <div><span className="text-slate-400 block">Date:</span><strong>{selectedApp.page7?.childminderDate || '—'}</strong></div>
                      </div>
                    </div>

                    <div className="text-slate-500 italic pt-2">
                      Please note that the Parent/Guardian signing above is responsible for paying fees.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
