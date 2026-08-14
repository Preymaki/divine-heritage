/**
 * EditModal
 *
 * Modal dialog for editing an existing gallery item.
 *
 * Allows the admin to:
 *  1. Replace the image (swap) — pick a new file; the old one is removed from Storage
 *  2. Edit metadata — title, alt text, caption
 *  3. Toggle published state
 *
 * The gallery group and sort order are intentionally locked (greyed out) so
 * the fixed 18-slot layout on the public page is preserved. The admin can only
 * swap the image inside an existing slot.
 */

import { useState, useEffect, useRef, useCallback, type FormEvent, type ChangeEvent } from 'react'
import { X, Pencil, CheckCircle, AlertTriangle, ImagePlus, Loader2 } from 'lucide-react'
import type { GalleryItem, GalleryItemPatch, ActionState, UploadState } from '@appTypes/gallery'
import { GALLERY_GROUP_LABELS, GALLERY_GROUP_BADGES } from '@appTypes/gallery'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditModalProps {
  item: GalleryItem | null
  isOpen: boolean
  onClose: () => void
  /** Save metadata-only changes */
  onSave: (id: string, patch: GalleryItemPatch) => Promise<void>
  /** Replace the actual image file */
  onReplaceImage: (id: string, oldStoragePath: string | null, newFile: File) => Promise<void>
  actionState: ActionState
  uploadState: UploadState
  onReset: () => void
  onResetUpload: () => void
}

// ---------------------------------------------------------------------------
// Accepted image types
// ---------------------------------------------------------------------------

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_MB  = 10

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditModal({
  item,
  isOpen,
  onClose,
  onSave,
  onReplaceImage,
  actionState,
  uploadState,
  onReset,
  onResetUpload,
}: EditModalProps) {
  // ── Form state ───────────────────────────────────────────────────────────
  const [title, setTitle]         = useState('')
  const [altText, setAltText]     = useState('')
  const [caption, setCaption]     = useState('')
  const [isPublished, setIsPublished] = useState(true)

  // Image replacement state
  const [newFile,      setNewFile]      = useState<File | null>(null)
  const [previewURL,   setPreviewURL]   = useState<string | null>(null)
  const [fileError,    setFileError]    = useState<string | null>(null)
  const fileRef  = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const isBusy    = actionState.phase === 'pending' || uploadState.phase === 'uploading'
  const isSuccess = actionState.phase === 'success' || uploadState.phase === 'success'
  const isError   = actionState.phase === 'error'   || uploadState.phase === 'error'
  const errorMsg  = actionState.error ?? uploadState.error
  const locationBadge = GALLERY_GROUP_BADGES[item?.group ?? 'other'] ?? 'General'

  // Populate fields when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setAltText(item.altText)
      setCaption(item.caption)
      setIsPublished(item.isPublished)
    }
    // Reset image swap state whenever a new item is loaded
    setNewFile(null)
    setPreviewURL(null)
    setFileError(null)
  }, [item])

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => {
        onReset()
        onResetUpload()
        onClose()
        setNewFile(null)
        setPreviewURL(null)
      }, 1200)
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
    onResetUpload()
    setNewFile(null)
    setPreviewURL(null)
    setFileError(null)
    onClose()
  }

  // ── File picker ───────────────────────────────────────────────────────────

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_MB} MB.`)
      return
    }

    setNewFile(file)
    setPreviewURL(URL.createObjectURL(file))
  }, [])

  function clearFileSelection() {
    setNewFile(null)
    setPreviewURL(null)
    setFileError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!item || isBusy) return

    // If a new image was picked, run the replace flow
    if (newFile) {
      await onReplaceImage(item.id, item.storagePath, newFile)
      return
    }

    // Otherwise run a metadata-only patch
    const patch: GalleryItemPatch = {}
    if (title       !== item.title)       patch.title       = title
    if (altText     !== item.altText)     patch.altText     = altText
    if (caption     !== item.caption)     patch.caption     = caption
    if (isPublished !== item.isPublished) patch.isPublished = isPublished
    if (Object.keys(patch).length === 0)  { handleClose(); return }
    await onSave(item.id, patch)
  }

  if (!isOpen || !item) return null

  const displayURL = previewURL ?? item.downloadURL

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
          <div>
            <h2 id="edit-modal-title" className="modal-title">
              <Pencil size={16} aria-hidden="true" />
              Edit Image Slot
            </h2>
            <div className="text-[11px] font-bold text-[var(--color-primary-600)] bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] px-2.5 py-0.5 rounded-full w-fit mt-1">
              Location: {locationBadge} — {GALLERY_GROUP_LABELS[item.group]}
            </div>
          </div>
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
            <p className="modal-success-title">
              {newFile ? 'Image replaced!' : 'Saved!'}
            </p>
            <p className="modal-success-sub">Changes will appear immediately.</p>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">

              {/* ── Image swap section ───────────────────────────────── */}
              <div className="edit-swap-section">
                {/* Current / preview image */}
                <div className="edit-swap-preview-wrap">
                  <img
                    src={displayURL}
                    alt={item.altText}
                    className="edit-swap-img"
                    loading="lazy"
                    decoding="async"
                  />
                  {newFile && (
                    <div className="edit-swap-new-badge" aria-label="New image selected">
                      New
                    </div>
                  )}
                </div>

                {/* Swap controls */}
                <div className="edit-swap-controls">
                  <p className="edit-swap-label">
                    {item.storagePath ? item.storagePath.split('/').pop() : 'Original website image'}
                  </p>
                  {newFile ? (
                    <div className="edit-swap-chosen">
                      <span className="edit-swap-chosen-name" title={newFile.name}>
                        {newFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearFileSelection}
                        disabled={isBusy}
                        className="edit-swap-clear-btn"
                        aria-label="Remove selected image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={isBusy}
                      className="edit-swap-pick-btn"
                      id="edit-pick-image-btn"
                    >
                      <ImagePlus size={14} aria-hidden="true" />
                      Replace Image
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    onChange={handleFileChange}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  {fileError && (
                    <p className="edit-swap-file-error" role="alert">
                      <AlertTriangle size={12} aria-hidden="true" />
                      {fileError}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload progress bar */}
              {uploadState.phase === 'uploading' && (
                <div className="edit-upload-progress" role="status" aria-label="Uploading new image">
                  <div className="edit-upload-track">
                    <div
                      className="edit-upload-bar"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <span className="edit-upload-pct">{Math.round(uploadState.progress)}%</span>
                </div>
              )}

              {/* ── Metadata fields (hidden when a new image is queued) ── */}
              {!newFile && (
                <>
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

                  {/* Group — read-only, shown for info only */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Gallery section</label>
                    <div className="edit-group-badge">
                      {GALLERY_GROUP_LABELS[item.group]}
                      <span className="edit-group-badge-lock" title="Section is locked to preserve the public layout">
                        Locked
                      </span>
                    </div>
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
                </>
              )}

              {/* Image-swap info note */}
              {newFile && (
                <p className="edit-swap-info">
                  The existing image will be replaced. Title, alt text and caption
                  will stay unchanged — you can update them after saving.
                </p>
              )}

              {/* Error */}
              {isError && errorMsg && (
                <div role="alert" className="modal-field-error modal-field-error--standalone">
                  <AlertTriangle size={14} aria-hidden="true" />
                  {errorMsg}
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
                disabled={(!newFile && (!title.trim() || !altText.trim())) || isBusy}
                className="cms-btn-primary"
              >
                {isBusy ? (
                  <><Loader2 size={14} className="admin-spin" aria-hidden="true" />
                    {uploadState.phase === 'uploading' ? 'Uploading…' : 'Saving…'}
                  </>
                ) : newFile ? (
                  <><ImagePlus size={14} aria-hidden="true" /> Save & Replace Image</>
                ) : (
                  <><Pencil size={14} aria-hidden="true" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
