/**
 * EditModal
 *
 * Modal dialog for editing an existing gallery item's metadata.
 * Pre-populates all fields from the current item and submits only changed values.
 *
 * Reuses admin-input, upload-toggle, modal-* CSS from globals.css.
 * No new CSS classes are added.
 */

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { X, Pencil, CheckCircle, AlertTriangle } from 'lucide-react'
import type { GalleryItem, GalleryItemPatch, GalleryGroup, ActionState } from '@appTypes/gallery'
import { GALLERY_GROUP_LABELS, GALLERY_GROUP_ORDER } from '@appTypes/gallery'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditModalProps {
  item: GalleryItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, patch: GalleryItemPatch) => Promise<void>
  actionState: ActionState
  onReset: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditModal({
  item,
  isOpen,
  onClose,
  onSave,
  actionState,
  onReset,
}: EditModalProps) {
  const [title,       setTitle]       = useState('')
  const [altText,     setAltText]     = useState('')
  const [caption,     setCaption]     = useState('')
  const [group,       setGroup]       = useState<GalleryGroup>('other')
  const [isPublished, setIsPublished] = useState(true)

  const closeRef = useRef<HTMLButtonElement>(null)
  const isBusy    = actionState.phase === 'pending'
  const isSuccess = actionState.phase === 'success'
  const isError   = actionState.phase === 'error'

  // Populate fields when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setAltText(item.altText)
      setCaption(item.caption)
      setGroup(item.group)
      setIsPublished(item.isPublished)
    }
  }, [item])

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => { onReset(); onClose() }, 1200)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  // Focus + scroll lock
  useEffect(() => {
    if (isOpen) setTimeout(() => closeRef.current?.focus(), 50)
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isBusy) handleClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isBusy])

  function handleClose() {
    if (isBusy) return
    onReset()
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!item || isBusy) return
    const patch: GalleryItemPatch = {}
    if (title       !== item.title)       patch.title       = title
    if (altText     !== item.altText)     patch.altText     = altText
    if (caption     !== item.caption)     patch.caption     = caption
    if (group       !== item.group)       patch.group       = group
    if (isPublished !== item.isPublished) patch.isPublished = isPublished
    if (Object.keys(patch).length === 0)  { handleClose(); return }
    await onSave(item.id, patch)
  }

  if (!isOpen || !item) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) handleClose() }}
      role="presentation"
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title">
            <Pencil size={16} aria-hidden="true" />
            Edit Image
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="modal-close-btn"
            aria-label="Close edit dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success */}
        {isSuccess && (
          <div className="modal-success-state" role="status">
            <CheckCircle size={36} className="modal-success-icon" aria-hidden="true" />
            <p className="modal-success-title">Saved!</p>
            <p className="modal-success-sub">Changes will appear immediately.</p>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {/* Preview thumbnail */}
              <div className="edit-modal-preview">
                <img
                  src={item.downloadURL}
                  alt={item.altText}
                  className="edit-modal-thumb"
                  loading="lazy"
                  decoding="async"
                />
                <p className="edit-modal-filename">
                  {item.storagePath ? item.storagePath.split('/').pop() : 'Static asset'}
                </p>
              </div>

              {/* Title */}
              <div className="admin-form-group">
                <label htmlFor="edit-title" className="admin-form-label">
                  Title <span className="required-star" aria-hidden="true">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className="admin-input admin-input--no-icon"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  disabled={isBusy}
                  maxLength={120}
                />
              </div>

              {/* Alt text */}
              <div className="admin-form-group">
                <label htmlFor="edit-alt" className="admin-form-label">
                  Alt text <span className="required-star" aria-hidden="true">*</span>
                </label>
                <input
                  id="edit-alt"
                  type="text"
                  className="admin-input admin-input--no-icon"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  required
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              {/* Caption */}
              <div className="admin-form-group">
                <label htmlFor="edit-caption" className="admin-form-label">
                  Caption <span className="upload-optional">(optional)</span>
                </label>
                <input
                  id="edit-caption"
                  type="text"
                  className="admin-input admin-input--no-icon"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              {/* Group */}
              <div className="admin-form-group">
                <label htmlFor="edit-group" className="admin-form-label">
                  Gallery group
                </label>
                <select
                  id="edit-group"
                  className="admin-input admin-input--no-icon"
                  value={group}
                  onChange={e => setGroup(e.target.value as GalleryGroup)}
                  disabled={isBusy}
                >
                  {GALLERY_GROUP_ORDER.map((g) => (
                    <option key={g} value={g}>{GALLERY_GROUP_LABELS[g]}</option>
                  ))}
                </select>
              </div>

              {/* Publish toggle */}
              <label className="upload-toggle-row" htmlFor="edit-publish">
                <div className="upload-toggle-text">
                  <span className="upload-toggle-label">Published</span>
                  <span className="upload-toggle-desc">
                    {isPublished ? 'Visible on the public gallery' : 'Hidden from the public gallery'}
                  </span>
                </div>
                <button
                  type="button"
                  id="edit-publish"
                  role="switch"
                  aria-checked={isPublished}
                  onClick={() => setIsPublished(p => !p)}
                  disabled={isBusy}
                  className={['upload-toggle', isPublished ? 'upload-toggle--on' : ''].filter(Boolean).join(' ')}
                >
                  <span className="upload-toggle-thumb" />
                </button>
              </label>

              {/* Error */}
              {isError && actionState.error && (
                <div role="alert" className="modal-field-error modal-field-error--standalone">
                  <AlertTriangle size={14} aria-hidden="true" />
                  {actionState.error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" onClick={handleClose} disabled={isBusy} className="cms-btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                id="edit-save-btn"
                disabled={!title.trim() || !altText.trim() || isBusy}
                className="cms-btn-primary"
              >
                {isBusy ? (
                  <><span className="admin-btn-spinner" aria-hidden="true" />Saving…</>
                ) : (
                  <>
                    <Pencil size={14} aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
