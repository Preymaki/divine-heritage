/**
 * AdminPolicies — /admin/policies
 *
 * CMS page for managing policy documents in Divine Heritage Childcare Services.
 *
 * The admin can:
 *  - View all policies organized by category (Learning & Development, Safeguarding, Operational, Health & Safety)
 *  - Filter policies by category
 *  - Add a new policy (title + category + content + published/hidden)
 *  - Edit an existing policy
 *  - Toggle published / hidden
 *  - Reorder policies (move up / move down)
 *  - Delete a policy (with confirmation)
 *  - One-click Sync / Reset to the Official September 2026 – September 2027 Handbook (23 policies verbatim)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  X,
  FileText,
  Sparkles,
  RefreshCw,
  Tag,
  ShieldCheck,
} from 'lucide-react'
import { usePolicies } from '@hooks/usePolicies'
import type { Policy } from '@appTypes/policy'
import PageHeader from '@components/admin/PageHeader'

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const STANDARD_CATEGORIES = [
  'Learning & Development',
  'Safeguarding & Child Policies',
  'Operational & Staffing Policies',
  'Health & Safety Policies',
] as const

function formatDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts as unknown as string)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function toAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isLegacySeed(items: Policy[]): boolean {
  if (items.length === 0) return true
  const titles = new Set(items.map((i) => i.title.trim().toLowerCase()))
  return titles.has('holidays') || !titles.has('prevent duty & counter-extremism policy')
}

// ---------------------------------------------------------------------------
// Add / Edit Modal
// ---------------------------------------------------------------------------

interface PolicyFormData {
  title: string
  category: string
  content: string
  isPublished: boolean
}

interface PolicyModalProps {
  mode: 'add' | 'edit'
  initial?: PolicyFormData
  isPending: boolean
  error: string | null
  onSave: (data: PolicyFormData) => void
  onClose: () => void
}

function PolicyModal({ mode, initial, isPending, error, onSave, onClose }: PolicyModalProps) {
  const [title, setTitle]             = useState(initial?.title       ?? '')
  const [category, setCategory]       = useState(initial?.category    ?? STANDARD_CATEGORIES[0])
  const [content, setContent]         = useState(initial?.content     ?? '')
  const [isPublished, setPublished]   = useState(initial?.isPublished ?? true)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      category: category.trim() || STANDARD_CATEGORIES[0],
      content: content.trim(),
      isPublished,
    })
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="admin-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'add' ? 'Add Policy' : 'Edit Policy'}
    >
      <div className="admin-modal admin-modal--lg">
        {/* Header */}
        <div className="admin-modal-header">
          <span className="admin-modal-title">
            {mode === 'add' ? 'Add Policy' : 'Edit Policy'}
          </span>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isPending}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          {/* Title */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="policy-modal-title">
              Policy Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="policy-modal-title"
              ref={titleRef}
              type="text"
              className="admin-form-input"
              placeholder="e.g. Prevent Duty & Counter-Extremism Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="policy-modal-category">
              Handbook Category <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                id="policy-modal-category"
                className="admin-form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isPending}
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!STANDARD_CATEGORIES.includes(category as unknown as typeof STANDARD_CATEGORIES[number]) && category && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>
            <p className="admin-form-hint">
              Groups this policy under one of the 4 official sections of the Divine Heritage handbook.
            </p>
          </div>

          {/* Content */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="policy-modal-content">
              Policy Content <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="policy-modal-content"
              className="admin-form-input"
              style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: '0.875rem' }}
              placeholder={`Write the verbatim policy text here.\n\nSeparate paragraphs with a blank line.\nStart bullet points with: • or - \nStart sub-bullets with: o \nStart numbered items with: 1. 2. 3.`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />
            <p className="admin-form-hint">
              Separate paragraphs with a blank line. Bullet items start with <code>• </code> or <code>- </code>, sub-bullets start with <code>o </code>, numbered items start with <code>1. </code>, and telephone/email links are auto-formatted.
            </p>
          </div>

          {/* Visibility toggle */}
          <div className="admin-form-group">
            <label className="admin-form-label">Visibility</label>
            <div className="admin-toggle-group">
              <button
                type="button"
                className={`admin-toggle-btn ${isPublished ? 'admin-toggle-btn--active-publish' : ''}`}
                onClick={() => setPublished(true)}
                disabled={isPending}
              >
                <Eye size={14} /> Published
              </button>
              <button
                type="button"
                className={`admin-toggle-btn ${!isPublished ? 'admin-toggle-btn--active-hidden' : ''}`}
                onClick={() => setPublished(false)}
                disabled={isPending}
              >
                <EyeOff size={14} /> Hidden
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="admin-modal-error" role="alert">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button
            type="button"
            className="cms-btn-ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cms-btn-primary"
            onClick={handleSave}
            disabled={isPending || !title.trim()}
            id={mode === 'add' ? 'policy-modal-save-add' : 'policy-modal-save-edit'}
          >
            {isPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Saving…</>
            ) : (
              mode === 'add' ? 'Add Policy' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sync Confirmation Modal
// ---------------------------------------------------------------------------

interface SyncModalProps {
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

function SyncModal({ isPending, error, onConfirm, onClose }: SyncModalProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Sync Official Policies">
      <div className="admin-modal admin-modal--sm">
        <div className="admin-modal-header">
          <span className="admin-modal-title">Sync Official 2026–2027 Handbook</span>
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={isPending} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">
          <p className="admin-delete-modal-desc">
            This will update Firestore with all <strong>23 official policies</strong> from the September 2026 – September 2027 Policy Handbook with zero AI modifications.
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
            Existing legacy policies will be replaced with the official handbook content. You will be able to edit, customize, and reorder all policies afterwards.
          </p>
          {error && <p className="admin-modal-error" role="alert">{error}</p>}
        </div>
        <div className="admin-modal-footer">
          <button type="button" className="cms-btn-ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            type="button"
            className="cms-btn-primary"
            onClick={onConfirm}
            disabled={isPending}
            id="policy-sync-confirm-btn"
          >
            {isPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Syncing…</>
            ) : (
              <><Sparkles size={14} />Confirm Sync</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

interface DeleteModalProps {
  policy: Policy
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

function DeleteModal({ policy, isPending, error, onConfirm, onClose }: DeleteModalProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Delete Policy">
      <div className="admin-modal admin-modal--sm">
        <div className="admin-modal-header">
          <span className="admin-modal-title">Delete Policy</span>
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={isPending} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">
          <p className="admin-delete-modal-desc">
            Are you sure you want to permanently delete <strong>&ldquo;{policy.title}&rdquo;</strong>?
            This cannot be undone.
          </p>
          {error && <p className="admin-modal-error" role="alert">{error}</p>}
        </div>
        <div className="admin-modal-footer">
          <button type="button" className="cms-btn-ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            type="button"
            className="cms-btn-danger"
            onClick={onConfirm}
            disabled={isPending}
            id="policy-delete-confirm-btn"
          >
            {isPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Deleting…</>
            ) : (
              <><Trash2 size={14} />Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminPolicies() {
  const {
    policies, loading, error,
    actionState, seedState,
    addPolicy, updatePolicy, deletePolicy, togglePublish, moveUp, moveDown,
    syncOfficialPolicies, resetAction,
  } = usePolicies()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [showSyncModal,   setShowSyncModal]   = useState(false)
  const [policyToEdit,   setPolicyToEdit]    = useState<Policy | null>(null)
  const [policyToDelete, setPolicyToDelete]  = useState<Policy | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenAdd = useCallback(() => {
    resetAction()
    setShowAddModal(true)
  }, [resetAction])

  const handleCloseAdd = useCallback(() => {
    if (actionState.phase === 'pending') return
    setShowAddModal(false)
    resetAction()
  }, [actionState.phase, resetAction])

  const handleSaveAdd = useCallback(async (data: PolicyFormData) => {
    const nextOrder = policies.length > 0
      ? Math.max(...policies.map((p) => p.order)) + 1
      : 0
    await addPolicy({ ...data, order: nextOrder })
    setShowAddModal(false)
    resetAction()
  }, [addPolicy, policies, resetAction])

  const handleOpenEdit = useCallback((policy: Policy) => {
    resetAction()
    setPolicyToEdit(policy)
  }, [resetAction])

  const handleCloseEdit = useCallback(() => {
    if (actionState.phase === 'pending') return
    setPolicyToEdit(null)
    resetAction()
  }, [actionState.phase, resetAction])

  const handleSaveEdit = useCallback(async (data: PolicyFormData) => {
    if (!policyToEdit) return
    await updatePolicy(policyToEdit.id, data)
    setPolicyToEdit(null)
    resetAction()
  }, [policyToEdit, updatePolicy, resetAction])

  const handleOpenDelete = useCallback((policy: Policy) => {
    resetAction()
    setPolicyToDelete(policy)
  }, [resetAction])

  const handleCloseDelete = useCallback(() => {
    if (actionState.phase === 'pending') return
    setPolicyToDelete(null)
    resetAction()
  }, [actionState.phase, resetAction])

  const handleConfirmDelete = useCallback(async () => {
    if (!policyToDelete) return
    await deletePolicy(policyToDelete.id)
    setPolicyToDelete(null)
    resetAction()
  }, [policyToDelete, deletePolicy, resetAction])

  const handleOpenSync = useCallback(() => {
    resetAction()
    setShowSyncModal(true)
  }, [resetAction])

  const handleCloseSync = useCallback(() => {
    if (seedState.phase === 'pending') return
    setShowSyncModal(false)
    resetAction()
  }, [seedState.phase, resetAction])

  const handleConfirmSync = useCallback(async () => {
    await syncOfficialPolicies()
    setShowSyncModal(false)
    resetAction()
  }, [syncOfficialPolicies, resetAction])

  // ── Computed ─────────────────────────────────────────────────────────────
  const isLegacy = useMemo(() => !loading && isLegacySeed(policies), [loading, policies])
  const showSyncBanner = !loading && !error && (policies.length === 0 || isLegacy)
  const isSyncPending   = seedState.phase === 'pending'
  const isActionPending = actionState.phase === 'pending'

  // Filtered policies by category
  const filteredPolicies = useMemo(() => {
    if (selectedCategory === 'all') return policies
    return policies.filter((p) => (p.category || STANDARD_CATEGORIES[0]) === selectedCategory)
  }, [policies, selectedCategory])

  return (
    <div className="cms-page">
      {/* ── Page Header ── */}
      <PageHeader
        title="Policies"
        subtitle="Manage, edit, reorder, and synchronize official policy handbook entries on the website."
        action={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="policy-sync-btn"
              onClick={handleOpenSync}
              className="cms-btn-secondary"
              disabled={loading || isSyncPending}
              title="Synchronize all 23 official handbook policies into Firestore"
            >
              <RefreshCw size={15} className={isSyncPending ? 'admin-btn-spinner' : ''} aria-hidden="true" />
              Sync Official Handbook
            </button>
            <button
              type="button"
              id="policy-add-btn"
              onClick={handleOpenAdd}
              className="cms-btn-primary"
              disabled={loading}
            >
              <Plus size={15} aria-hidden="true" />
              Add Policy
            </button>
          </div>
        }
      />

      {/* ── Firestore error ── */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <strong>Could not load policies:</strong> {error}
        </div>
      )}

      {/* ── Official Handbook Sync Banner ── */}
      {showSyncBanner && (
        <div className="admin-seed-banner" role="region" aria-label="Official Handbook Sync">
          <div className="admin-seed-banner-icon">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div className="admin-seed-banner-body">
            <p className="admin-seed-banner-title">
              {policies.length === 0 ? 'No policies in database' : 'Update to Official 2026–2027 Policy Handbook'}
            </p>
            <p className="admin-seed-banner-desc">
              {policies.length === 0
                ? 'Your database currently has no policies. Click the button below to import all 23 official policies from the September 2026 – September 2027 Handbook directly into Firestore.'
                : 'Your database currently contains legacy policy records. Click below to synchronize with the official September 2026 – September 2027 Handbook (23 policies categorized under Learning & Development, Safeguarding, Operational, and Health & Safety).'}
            </p>
            {seedState.phase === 'error' && seedState.error && (
              <p className="admin-seed-banner-error" role="alert">{seedState.error}</p>
            )}
            {seedState.phase === 'success' && (
              <p className="admin-seed-banner-success" role="status">
                ✓ All 23 official policies synchronized successfully! You can now edit and manage them below.
              </p>
            )}
          </div>
          <button
            type="button"
            id="policy-sync-banner-btn"
            onClick={syncOfficialPolicies}
            disabled={isSyncPending || seedState.phase === 'success'}
            className="cms-btn-primary admin-seed-btn"
          >
            {isSyncPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Syncing…</>
            ) : (
              <><ShieldCheck size={15} aria-hidden="true" />Sync 2026–2027 Handbook</>
            )}
          </button>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          Loading policies…
        </div>
      )}

      {/* ── Policy list ── */}
      {!loading && !error && policies.length > 0 && (
        <>
          {/* Controls bar: Category filter & Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.5rem 0',
            }}
          >
            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }} role="tablist" aria-label="Filter by category">
              <button
                type="button"
                className={`admin-filter-pill ${selectedCategory === 'all' ? 'admin-filter-pill--active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All ({policies.length})
              </button>
              {STANDARD_CATEGORIES.map((cat) => {
                const count = policies.filter((p) => p.category === cat).length
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`admin-filter-pill ${selectedCategory === cat ? 'admin-filter-pill--active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* Stats */}
            <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#15803d' }}>
                {policies.filter((p) => p.isPublished).length} published
              </span>
              <span>
                {policies.filter((p) => !p.isPublished).length} hidden
              </span>
            </div>
          </div>

          <div className="policy-list" role="list" aria-label="Policy documents">
            {filteredPolicies.map((policy, idx) => (
              <div
                key={policy.id}
                className="policy-row"
                role="listitem"
                id={`policy-row-${toAnchorId(policy.title)}`}
              >
                {/* ↑ ↓ reorder */}
                <div className="policy-row-order">
                  <span className="policy-row-order-num">{idx + 1}</span>
                  <button
                    type="button"
                    className="policy-row-move-btn"
                    onClick={() => moveUp(policy)}
                    disabled={idx === 0 || isActionPending}
                    aria-label={`Move "${policy.title}" up`}
                    title="Move up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    className="policy-row-move-btn"
                    onClick={() => moveDown(policy)}
                    disabled={idx === policies.length - 1 || isActionPending}
                    aria-label={`Move "${policy.title}" down`}
                    title="Move down"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>

                {/* Icon */}
                <FileText size={18} style={{ color: '#94a3b8', flexShrink: 0 }} aria-hidden="true" />

                {/* Info */}
                <div className="policy-row-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <p className="policy-row-title">{policy.title}</p>
                    {policy.category && (
                      <span className="admin-category-badge">
                        <Tag size={10} />
                        {policy.category}
                      </span>
                    )}
                  </div>
                  <div className="policy-row-meta">
                    <span
                      className={`policy-status-badge ${policy.isPublished ? 'policy-status-badge--published' : 'policy-status-badge--hidden'}`}
                    >
                      {policy.isPublished ? 'Published' : 'Hidden'}
                    </span>
                    {policy.updatedAt && (
                      <span className="policy-row-date">
                        Updated {formatDate(policy.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="policy-row-actions">
                  <button
                    type="button"
                    className="policy-action-btn policy-action-btn--edit"
                    onClick={() => handleOpenEdit(policy)}
                    disabled={isActionPending}
                    aria-label={`Edit "${policy.title}"`}
                    id={`policy-edit-btn-${toAnchorId(policy.title)}`}
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={`policy-action-btn ${policy.isPublished ? 'policy-action-btn--toggle-hide' : 'policy-action-btn--toggle'}`}
                    onClick={() => togglePublish(policy)}
                    disabled={isActionPending}
                    aria-label={policy.isPublished ? `Hide "${policy.title}"` : `Publish "${policy.title}"`}
                    id={`policy-toggle-btn-${toAnchorId(policy.title)}`}
                  >
                    {policy.isPublished ? <><EyeOff size={13} /><span>Hide</span></> : <><Eye size={13} /><span>Publish</span></>}
                  </button>
                  <button
                    type="button"
                    className="policy-action-btn policy-action-btn--delete"
                    onClick={() => handleOpenDelete(policy)}
                    disabled={isActionPending}
                    aria-label={`Delete "${policy.title}"`}
                    id={`policy-delete-btn-${toAnchorId(policy.title)}`}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && policies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon-wrap">
            <FileText size={28} className="empty-state-icon" aria-hidden="true" />
          </div>
          <p className="empty-state-title">No policies yet</p>
          <p className="empty-state-desc">
            Synchronize with the official handbook above, or click "+ Add Policy" to create a custom policy.
          </p>
          <div className="empty-state-action" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button type="button" className="cms-btn-primary" onClick={syncOfficialPolicies} id="policy-empty-sync-btn">
              <Sparkles size={15} />Sync Official Handbook
            </button>
            <button type="button" className="cms-btn-secondary" onClick={handleOpenAdd} id="policy-empty-add-btn">
              <Plus size={15} />Add Custom Policy
            </button>
          </div>
        </div>
      )}

      {/* ── Add modal ── */}
      {showAddModal && (
        <PolicyModal
          mode="add"
          isPending={isActionPending}
          error={actionState.phase === 'error' ? actionState.error : null}
          onSave={handleSaveAdd}
          onClose={handleCloseAdd}
        />
      )}

      {/* ── Edit modal ── */}
      {policyToEdit && (
        <PolicyModal
          mode="edit"
          initial={{
            title:       policyToEdit.title,
            category:    policyToEdit.category || STANDARD_CATEGORIES[0],
            content:     policyToEdit.content,
            isPublished: policyToEdit.isPublished,
          }}
          isPending={isActionPending}
          error={actionState.phase === 'error' ? actionState.error : null}
          onSave={handleSaveEdit}
          onClose={handleCloseEdit}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {policyToDelete && (
        <DeleteModal
          policy={policyToDelete}
          isPending={isActionPending}
          error={actionState.phase === 'error' ? actionState.error : null}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      )}

      {/* ── Sync confirmation modal ── */}
      {showSyncModal && (
        <SyncModal
          isPending={isSyncPending}
          error={seedState.phase === 'error' ? seedState.error : null}
          onConfirm={handleConfirmSync}
          onClose={handleCloseSync}
        />
      )}
    </div>
  )
}
