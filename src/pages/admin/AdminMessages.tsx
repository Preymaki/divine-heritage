/**
 * AdminMessages — /admin/messages
 *
 * Displays contact form submissions saved to the `enquiries` Firestore collection
 * or synced with local persistence.
 * Allows the admin to:
 *  - Mark messages as read / unread / archived
 *  - Delete enquiries
 *  - Directly Email, Call, or WhatsApp parents
 *  - Filter by status and search by parent name, email, or message keyword
 */

import { useEffect, useState, useMemo } from 'react'
import {
  MessageSquare,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  Inbox,
  CheckCheck,
  Archive,
  AlertCircle,
  Trash2,
  ExternalLink,
  Search,
  MessageCircle,
} from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'
import {
  subscribeToEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from '@services/enquiries'
import type { Enquiry, EnquiryStatus } from '@appTypes/enquiry'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: Enquiry['createdAt']): string {
  if (!ts) return 'Just now'
  try {
    let date: Date
    const raw = ts as unknown
    if (typeof raw === 'object' && raw !== null && 'toDate' in raw && typeof (raw as { toDate: () => Date }).toDate === 'function') {
      date = (raw as { toDate: () => Date }).toDate()
    } else if (raw instanceof Date) {
      date = raw
    } else if (typeof raw === 'object' && raw !== null && 'seconds' in raw) {
      date = new Date((raw as { seconds: number }).seconds * 1000)
    } else if (typeof raw === 'string' || typeof raw === 'number') {
      date = new Date(raw)
    } else {
      return '—'
    }

    if (isNaN(date.getTime())) return '—'

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return '44' + digits.slice(1)
  }
  return digits
}

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  unread:   'Unread',
  read:     'Read',
  archived: 'Archived',
}

const STATUS_PILL: Record<EnquiryStatus, string> = {
  unread:   'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] font-semibold',
  read:     'bg-[var(--color-sage-50)] text-[var(--color-sage-700)] border border-[var(--color-sage-200)] font-medium',
  archived: 'bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] font-medium',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminMessages() {
  const [enquiries, setEnquiries]   = useState<Enquiry[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [updating, setUpdating]     = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter]         = useState<EnquiryStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsub = subscribeToEnquiries(
      (data) => {
        setEnquiries(data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.warn('[AdminMessages] Error:', err.message)
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  async function handleStatusChange(id: string, status: EnquiryStatus) {
    setUpdating(id)
    try {
      await updateEnquiryStatus(id, status)
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete the enquiry from "${name}"? This cannot be undone.`)) {
      return
    }
    setDeletingId(id)
    try {
      await deleteEnquiry(id)
    } catch (err) {
      console.error('Delete enquiry failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const unreadCount = enquiries.filter((e) => e.status === 'unread').length

  // Filtered & searched list
  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (filter !== 'all' && e.status !== filter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        e.parentName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.includes(q)) ||
        e.message.toLowerCase().includes(q) ||
        e.serviceType.toLowerCase().includes(q)
      )
    })
  }, [enquiries, filter, searchQuery])

  const btnBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const btnSecondary = `${btnBase} bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] hover:bg-[var(--color-primary-100)]`
  const btnGhost     = `${btnBase} bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]`
  const btnDanger    = `${btnBase} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700`

  return (
    <div className="cms-page">
      <PageHeader
        title="Messages & Enquiries"
        subtitle={
          loading
            ? 'Loading enquiries…'
            : unreadCount > 0
              ? `${unreadCount} unread enquir${unreadCount === 1 ? 'y' : 'ies'} from families.`
              : 'All caught up with no unread messages.'
        }
      />

      {/* Error banner */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <AlertCircle size={15} aria-hidden="true" />
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Search & Filter bar */}
      {!loading && enquiries.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-150 ${
                  filter === f
                    ? 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-sm font-semibold'
                    : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[var(--color-primary-300)]'
                }`}
              >
                {f === 'all'    ? `All (${enquiries.length})` :
                 f === 'unread' ? `Unread (${unreadCount})`   :
                 STATUS_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
            />
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#e2e8f0] animate-pulse border border-[#cbd5e1]" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title={
            searchQuery
              ? 'No matching messages'
              : filter === 'all'
                ? 'No messages yet'
                : `No ${filter} messages`
          }
          description={
            searchQuery
              ? `No messages matched "${searchQuery}". Try a different keyword.`
              : filter === 'all'
                ? 'When families submit the contact form on your website, their enquiries will appear here.'
                : `You have no messages with status "${filter}".`
          }
        />
      )}

      {/* Message cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((enquiry) => {
            const waNumber = enquiry.phone ? cleanPhoneForWhatsApp(enquiry.phone) : ''
            const mailSubject = encodeURIComponent(`Re: Childcare Inquiry from Divine Heritage - ${enquiry.parentName}`)

            return (
              <div
                key={enquiry.id}
                className={`bg-white rounded-2xl border p-5 md:p-6 transition-all duration-200 shadow-sm ${
                  enquiry.status === 'unread'
                    ? 'border-l-4 border-l-[var(--color-primary-500)] border-t-[#e2e8f0] border-r-[#e2e8f0] border-b-[#e2e8f0] bg-[var(--color-primary-50)]/20'
                    : 'border-[#e2e8f0] hover:border-[var(--color-primary-200)]'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                      <User size={18} className="text-[var(--color-primary-600)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-[#0f172a] text-base leading-tight">
                          {enquiry.parentName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${STATUS_PILL[enquiry.status]}`}>
                          {STATUS_LABELS[enquiry.status]}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] flex items-center gap-1.5">
                        <Calendar size={12} aria-hidden="true" />
                        Received: {formatDate(enquiry.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status & Delete Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {enquiry.status !== 'read' && (
                      <button
                        type="button"
                        disabled={updating === enquiry.id}
                        onClick={() => handleStatusChange(enquiry.id, 'read')}
                        className={btnSecondary}
                        title="Mark as read"
                      >
                        <CheckCheck size={13} aria-hidden="true" /> Mark read
                      </button>
                    )}
                    {enquiry.status === 'read' && (
                      <button
                        type="button"
                        disabled={updating === enquiry.id}
                        onClick={() => handleStatusChange(enquiry.id, 'unread')}
                        className={btnGhost}
                        title="Mark as unread"
                      >
                        <Inbox size={13} aria-hidden="true" /> Mark unread
                      </button>
                    )}
                    {enquiry.status !== 'archived' && (
                      <button
                        type="button"
                        disabled={updating === enquiry.id}
                        onClick={() => handleStatusChange(enquiry.id, 'archived')}
                        className={btnGhost}
                        title="Archive message"
                      >
                        <Archive size={13} aria-hidden="true" /> Archive
                      </button>
                    )}
                    {enquiry.status === 'archived' && (
                      <button
                        type="button"
                        disabled={updating === enquiry.id}
                        onClick={() => handleStatusChange(enquiry.id, 'unread')}
                        className={btnGhost}
                        title="Restore message"
                      >
                        <Inbox size={13} aria-hidden="true" /> Restore
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={deletingId === enquiry.id}
                      onClick={() => handleDelete(enquiry.id, enquiry.parentName)}
                      className={btnDanger}
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 size={13} aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>

                {/* Details summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-[#475569] mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-[var(--color-primary-500)] shrink-0" />
                    <span>Service: <strong className="text-slate-800">{enquiry.serviceType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[var(--color-primary-500)] shrink-0" />
                    <span>Child's Age: <strong className="text-slate-800">{enquiry.childAge}</strong></span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Message
                  </p>
                  <p className="text-sm text-[#1e293b] leading-relaxed bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] whitespace-pre-wrap">
                    {enquiry.message}
                  </p>
                </div>

                {/* Quick Contact / Reply actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">Quick Reply:</span>

                  {/* Email button */}
                  <a
                    href={`mailto:${enquiry.email}?subject=${mailSubject}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Mail size={13} />
                    <span>Email ({enquiry.email})</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>

                  {/* Phone Call button */}
                  {enquiry.phone && (
                    <a
                      href={`tel:${enquiry.phone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <Phone size={13} />
                      <span>Call ({enquiry.phone})</span>
                    </a>
                  )}

                  {/* WhatsApp button */}
                  {enquiry.phone && waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
