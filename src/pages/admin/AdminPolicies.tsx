/**
 * AdminPolicies — /admin/policies
 *
 * Simple CMS page for managing policy documents.
 *
 * The admin can:
 *  - Add a new policy (title + content textarea + published/hidden)
 *  - Edit an existing policy
 *  - Toggle published / hidden
 *  - Reorder policies (move up / move down)
 *  - Delete a policy (with confirmation)
 *  - Seed existing hardcoded content into Firestore (first-run only)
 */

import { useState, useCallback, useRef, useEffect } from 'react'
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
} from 'lucide-react'
import { usePolicies } from '@hooks/usePolicies'
import type { Policy } from '@appTypes/policy'
import PageHeader from '@components/admin/PageHeader'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts as unknown as string)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

// Generate a URL-safe anchor ID from a policy title
function toAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Add / Edit Modal
// ---------------------------------------------------------------------------

interface PolicyFormData {
  title: string
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
  const [title, setTitle]           = useState(initial?.title       ?? '')
  const [content, setContent]       = useState(initial?.content     ?? '')
  const [isPublished, setPublished] = useState(initial?.isPublished ?? true)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), content: content.trim(), isPublished })
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Add Policy' : 'Edit Policy'}>
      <div className="admin-modal">
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
              placeholder="e.g. Emergency Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="policy-modal-content">
              Policy Content
            </label>
            <textarea
              id="policy-modal-content"
              className="admin-form-input"
              placeholder={`Write the full policy text here.\n\nSeparate paragraphs with a blank line.\nStart bullet points with: - \nStart numbered items with: 1. 2. 3.`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />
            <p className="admin-form-hint">
              Separate paragraphs with a blank line. Start bullet items with <code>- </code> and numbered items with <code>1. </code>
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
            Are you sure you want to permanently delete <strong>"{policy.title}"</strong>?
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
    seedPolicies, resetAction,
  } = usePolicies()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [policyToEdit,   setPolicyToEdit]    = useState<Policy | null>(null)
  const [policyToDelete, setPolicyToDelete]  = useState<Policy | null>(null)

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

  // ── Computed ─────────────────────────────────────────────────────────────
  const showSeedBanner = !loading && !error && policies.length === 0
  const isSeedPending  = seedState.phase === 'pending'
  const isActionPending = actionState.phase === 'pending'

  return (
    <div className="cms-page">
      {/* ── Page Header ── */}
      <PageHeader
        title="Policies"
        subtitle="Add, edit, reorder, and manage the visibility of policy entries on the public Policies page."
        action={
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
        }
      />

      {/* ── Firestore error ── */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <strong>Could not load policies:</strong> {error}
        </div>
      )}

      {/* ── Seed banner ── */}
      {showSeedBanner && (
        <div className="admin-seed-banner" role="region" aria-label="Policies initialisation">
          <div className="admin-seed-banner-icon">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div className="admin-seed-banner-body">
            <p className="admin-seed-banner-title">Import existing policy content</p>
            <p className="admin-seed-banner-desc">
              No policies found in Firestore. Click the button to import all 29 existing policies from the website directly into the database. You can then edit, reorder, or add more from this page.
            </p>
            {seedState.phase === 'error' && seedState.error && (
              <p className="admin-seed-banner-error" role="alert">{seedState.error}</p>
            )}
            {seedState.phase === 'success' && (
              <p className="admin-seed-banner-success" role="status">
                All 29 policies imported successfully! They are now live on the public Policies page.
              </p>
            )}
          </div>
          <button
            type="button"
            id="policy-seed-btn"
            onClick={seedPolicies}
            disabled={isSeedPending || seedState.phase === 'success'}
            className="cms-btn-primary admin-seed-btn"
          >
            {isSeedPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Importing…</>
            ) : (
              <><Sparkles size={15} aria-hidden="true" />Import Existing Policies</>
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
          {/* Stats bar */}
          <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>{policies.length} {policies.length === 1 ? 'policy' : 'policies'} total</span>
            <span style={{ color: '#15803d' }}>
              {policies.filter((p) => p.isPublished).length} published
            </span>
            <span>
              {policies.filter((p) => !p.isPublished).length} hidden
            </span>
          </div>

          <div className="policy-list" role="list" aria-label="Policy documents">
            {policies.map((policy, idx) => (
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
                  <p className="policy-row-title">{policy.title}</p>
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

      {/* ── Empty state (after seed) ── */}
      {!loading && !error && policies.length === 0 && seedState.phase !== 'idle' && seedState.phase !== 'pending' && (
        <div className="empty-state">
          <div className="empty-state-icon-wrap">
            <FileText size={28} className="empty-state-icon" aria-hidden="true" />
          </div>
          <p className="empty-state-title">No policies yet</p>
          <p className="empty-state-desc">
            Click "+ Add Policy" to create your first policy, or use the import button above to bring in the existing website content.
          </p>
          <div className="empty-state-action">
            <button type="button" className="cms-btn-primary" onClick={handleOpenAdd} id="policy-empty-add-btn">
              <Plus size={15} />Add Policy
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
    </div>
  )
}
