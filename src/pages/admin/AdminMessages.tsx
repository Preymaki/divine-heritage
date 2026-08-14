/**
 * AdminMessages — /admin/messages
 *
 * Displays contact form submissions saved to the `enquiries` Firestore collection.
 * Allows the admin to mark messages as read or archived.
 */

import { useEffect, useState } from 'react'
import { MessageSquare, Mail, Phone, User, Calendar, Tag, Inbox, CheckCheck, Archive, AlertCircle } from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'
import { subscribeToEnquiries, updateEnquiryStatus } from '@services/enquiries'
import type { Enquiry, EnquiryStatus } from '@appTypes/enquiry'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: Enquiry['createdAt']): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [updating, setUpdating]   = useState<string | null>(null)
  const [filter, setFilter]       = useState<EnquiryStatus | 'all'>('all')

  useEffect(() => {
    const unsub = subscribeToEnquiries(
      (data) => { setEnquiries(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  async function handleStatusChange(id: string, status: EnquiryStatus) {
    setUpdating(id)
    try {
      await updateEnquiryStatus(id, status)
    } finally {
      setUpdating(null)
    }
  }

  const filtered     = filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter)
  const unreadCount  = enquiries.filter((e) => e.status === 'unread').length

  const btnBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const btnSecondary = `${btnBase} bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] hover:bg-[var(--color-primary-100)]`
  const btnGhost     = `${btnBase} bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]`

  return (
    <div className="cms-page">
      <PageHeader
        title="Messages"
        subtitle={
          loading
            ? 'Loading enquiries…'
            : unreadCount > 0
              ? `${unreadCount} unread enquir${unreadCount === 1 ? 'y' : 'ies'} from families.`
              : 'All caught up — no unread messages.'
        }
      />

      {/* Error */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <AlertCircle size={15} aria-hidden="true" />
          <strong>Could not load messages:</strong> {error}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && !error && enquiries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-150 ${
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
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title={filter === 'all' ? 'No messages yet' : `No ${filter} messages`}
          description={
            filter === 'all'
              ? 'When families submit the contact form on your website, their enquiries will appear here.'
              : `You have no messages with status "${filter}".`
          }
        />
      )}

      {/* Message cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((enquiry) => (
            <div
              key={enquiry.id}
              className={`bg-white rounded-2xl border p-5 md:p-6 transition-all duration-200 shadow-sm ${
                enquiry.status === 'unread'
                  ? 'border-l-4 border-l-[var(--color-primary-500)] border-t-[#e2e8f0] border-r-[#e2e8f0] border-b-[#e2e8f0] bg-[var(--color-primary-50)]/30'
                  : 'border-[#e2e8f0] hover:border-[var(--color-primary-200)]'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                    <User size={16} className="text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0f172a] text-sm leading-tight mb-1">
                      {enquiry.parentName}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${STATUS_PILL[enquiry.status]}`}>
                      {STATUS_LABELS[enquiry.status]}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {enquiry.status !== 'read' && (
                    <button
                      type="button"
                      disabled={updating === enquiry.id}
                      onClick={() => handleStatusChange(enquiry.id, 'read')}
                      className={btnSecondary}
                    >
                      <CheckCheck size={13} aria-hidden="true" /> Mark read
                    </button>
                  )}
                  {enquiry.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={updating === enquiry.id}
                      onClick={() => handleStatusChange(enquiry.id, 'archived')}
                      className={btnGhost}
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
                    >
                      <Inbox size={13} aria-hidden="true" /> Restore
                    </button>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3 text-xs text-[#64748b]">
                <a
                  href={`mailto:${enquiry.email}`}
                  className="flex items-center gap-1.5 hover:text-[var(--color-primary-600)] transition-colors"
                >
                  <Mail size={12} aria-hidden="true" /> {enquiry.email}
                </a>
                {enquiry.phone && (
                  <a
                    href={`tel:${enquiry.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 hover:text-[var(--color-primary-600)] transition-colors"
                  >
                    <Phone size={12} aria-hidden="true" /> {enquiry.phone}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Tag size={12} aria-hidden="true" /> {enquiry.serviceType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} aria-hidden="true" /> {formatDate(enquiry.createdAt)}
                </span>
              </div>

              {/* Child age */}
              <p className="text-xs text-[#64748b] mb-3">
                Child's age: <span className="font-medium text-[#1e293b]">{enquiry.childAge}</span>
              </p>

              {/* Message */}
              <p className="text-sm text-[#1e293b] leading-relaxed bg-[#f8fafc] rounded-xl p-3.5 border border-[#e2e8f0] whitespace-pre-wrap">
                {enquiry.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
