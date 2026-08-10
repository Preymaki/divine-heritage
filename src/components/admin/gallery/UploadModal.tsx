/**
 * UploadModal
 *
 * Full-featured image upload dialog for the Gallery CMS.
 *
 * Features:
 *  - Drag-and-drop zone (with visual feedback)
 *  - Click-to-browse file picker (images only, max 10 MB)
 *  - Image preview before upload
 *  - Metadata form: title (required), alt text (required), caption (optional)
 *  - "Publish immediately" toggle (default: on)
 *  - Upload progress bar
 *  - Success and error states
 *  - Keyboard accessible (Escape closes, focus trapped)
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { X, UploadCloud, ImagePlus, CheckCircle, AlertTriangle } from 'lucide-react'
import type { GalleryItemInput, UploadState } from '@appTypes/gallery'
import UploadProgressBar from './UploadProgressBar'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, meta: GalleryItemInput) => Promise<void>
  uploadState: UploadState
  onReset: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EMPTY_META: GalleryItemInput = {
  title: '',
  altText: '',
  caption: '',
  isPublished: true,
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  uploadState,
  onReset,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [meta, setMeta] = useState<GalleryItemInput>(EMPTY_META)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const isBusy = uploadState.phase === 'uploading' || uploadState.phase === 'saving'
  const isSuccess = uploadState.phase === 'success'
  const isError = uploadState.phase === 'error'

  // ── Focus management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusableRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ── Keyboard close ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isBusy])

  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Preview URL cleanup ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // ── Reset on success (after a moment) ─────────────────────────────────────
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => {
        handleClose()
      }, 1800)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  // ---------------------------------------------------------------------------
  // File handling
  // ---------------------------------------------------------------------------

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return `Unsupported format. Please upload a JPEG, PNG, WebP, GIF, or AVIF image.`
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is 10 MB.`
    }
    return null
  }

  function acceptFile(f: File) {
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      return
    }
    setFileError(null)
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))

    // Auto-populate title from filename if empty
    if (!meta.title) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      setMeta(m => ({ ...m, title: name }))
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) acceptFile(f)
    e.target.value = '' // allow re-selecting the same file
  }

  // ---------------------------------------------------------------------------
  // Drag-and-drop
  // ---------------------------------------------------------------------------

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) acceptFile(f)
  }

  // ---------------------------------------------------------------------------
  // Form submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || isBusy) return
    await onUpload(file, meta)
  }

  // ---------------------------------------------------------------------------
  // Close / reset
  // ---------------------------------------------------------------------------

  const handleClose = useCallback(() => {
    if (isBusy) return
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setMeta(EMPTY_META)
    setFileError(null)
    setIsDragging(false)
    onReset()
    onClose()
  }, [isBusy, preview, onReset, onClose])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) handleClose() }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <h2 id="upload-modal-title" className="modal-title">
            <ImagePlus size={18} aria-hidden="true" />
            Upload Image
          </h2>
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="modal-close-btn"
            aria-label="Close upload dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Success state ── */}
        {isSuccess && (
          <div className="modal-success-state" role="status">
            <CheckCircle size={40} className="modal-success-icon" aria-hidden="true" />
            <p className="modal-success-title">Upload complete!</p>
            <p className="modal-success-sub">Your image has been added to the gallery.</p>
          </div>
        )}

        {/* ── Normal / error state ── */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">

              {/* Drop zone / preview */}
              {!file ? (
                <div
                  className={['upload-dropzone', isDragging ? 'upload-dropzone--active' : ''].filter(Boolean).join(' ')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Click or drag an image here to upload"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                >
                  <UploadCloud size={32} className="upload-dropzone-icon" aria-hidden="true" />
                  <p className="upload-dropzone-primary">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="upload-dropzone-secondary">or click to browse</p>
                  <p className="upload-dropzone-hint">JPEG, PNG, WebP, GIF, AVIF · Max 10 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileInput}
                    className="upload-file-input"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="upload-preview-wrap">
                  <img
                    src={preview ?? ''}
                    alt="Preview"
                    className="upload-preview-img"
                  />
                  <div className="upload-preview-meta">
                    <p className="upload-preview-filename">{file.name}</p>
                    <p className="upload-preview-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); setMeta(EMPTY_META) }}
                      className="upload-preview-change"
                      disabled={isBusy}
                    >
                      Change image
                    </button>
                  </div>
                </div>
              )}

              {/* File validation error */}
              {fileError && (
                <div role="alert" className="modal-field-error modal-field-error--standalone">
                  {fileError}
                </div>
              )}

              {/* Metadata form — only shown when a file is selected */}
              {file && (
                <div className="upload-form-fields">
                  {/* Title */}
                  <div className="admin-form-group">
                    <label htmlFor="upload-title" className="admin-form-label">
                      Title <span aria-hidden="true" className="required-star">*</span>
                    </label>
                    <input
                      id="upload-title"
                      type="text"
                      className="admin-input admin-input--no-icon"
                      placeholder="e.g. Children playing in the garden"
                      value={meta.title}
                      onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                      required
                      disabled={isBusy}
                      maxLength={120}
                    />
                  </div>

                  {/* Alt text */}
                  <div className="admin-form-group">
                    <label htmlFor="upload-alt" className="admin-form-label">
                      Alt text <span aria-hidden="true" className="required-star">*</span>
                    </label>
                    <input
                      id="upload-alt"
                      type="text"
                      className="admin-input admin-input--no-icon"
                      placeholder="Describe the image for screen readers"
                      value={meta.altText}
                      onChange={e => setMeta(m => ({ ...m, altText: e.target.value }))}
                      required
                      disabled={isBusy}
                      maxLength={200}
                    />
                    <p className="upload-field-hint">
                      Used by screen readers and search engines. Be descriptive.
                    </p>
                  </div>

                  {/* Caption */}
                  <div className="admin-form-group">
                    <label htmlFor="upload-caption" className="admin-form-label">
                      Caption <span className="upload-optional">(optional)</span>
                    </label>
                    <input
                      id="upload-caption"
                      type="text"
                      className="admin-input admin-input--no-icon"
                      placeholder="Short caption shown below the image"
                      value={meta.caption}
                      onChange={e => setMeta(m => ({ ...m, caption: e.target.value }))}
                      disabled={isBusy}
                      maxLength={200}
                    />
                  </div>

                  {/* Publish toggle */}
                  <label className="upload-toggle-row" htmlFor="upload-publish">
                    <div className="upload-toggle-text">
                      <span className="upload-toggle-label">Publish immediately</span>
                      <span className="upload-toggle-desc">
                        Show this image on the public gallery page
                      </span>
                    </div>
                    <button
                      type="button"
                      id="upload-publish"
                      role="switch"
                      aria-checked={meta.isPublished}
                      onClick={() => setMeta(m => ({ ...m, isPublished: !m.isPublished }))}
                      disabled={isBusy}
                      className={['upload-toggle', meta.isPublished ? 'upload-toggle--on' : ''].filter(Boolean).join(' ')}
                    >
                      <span className="upload-toggle-thumb" />
                    </button>
                  </label>
                </div>
              )}

              {/* Upload progress */}
              {(uploadState.phase === 'uploading' || uploadState.phase === 'saving') && (
                <UploadProgressBar
                  progress={uploadState.progress}
                  label={uploadState.phase === 'saving' ? 'Saving to database…' : 'Uploading image…'}
                />
              )}

              {/* Upload error */}
              {isError && uploadState.error && (
                <div role="alert" className="modal-field-error modal-field-error--standalone">
                  <AlertTriangle size={14} aria-hidden="true" />
                  {uploadState.error}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="cms-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="upload-submit-btn"
                disabled={!file || !meta.title.trim() || !meta.altText.trim() || isBusy}
                className="cms-btn-primary"
              >
                {isBusy ? (
                  <>
                    <span className="admin-btn-spinner" aria-hidden="true" />
                    {uploadState.phase === 'saving' ? 'Saving…' : 'Uploading…'}
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} aria-hidden="true" />
                    Upload Image
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
