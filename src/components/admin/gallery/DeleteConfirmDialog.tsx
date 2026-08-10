/**
 * DeleteConfirmDialog
 *
 * Confirmation modal before permanently deleting a gallery item.
 * Shows image thumbnail, title, and a clear warning.
 * Blocks the action while deletion is in progress.
 */

import { useRef, useEffect } from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import type { GalleryItem, ActionState } from '@appTypes/gallery'

interface DeleteConfirmDialogProps {
  item: GalleryItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, storagePath: string) => Promise<void>
  actionState: ActionState
  onReset: () => void
}

export default function DeleteConfirmDialog({
  item,
  isOpen,
  onClose,
  onConfirm,
  actionState,
  onReset,
}: DeleteConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const isBusy = actionState.phase === 'pending'
  const isError = actionState.phase === 'error'

  // Focus cancel button on open
  useEffect(() => {
    if (isOpen) setTimeout(() => cancelRef.current?.focus(), 50)
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
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

  async function handleConfirm() {
    if (!item || isBusy) return
    await onConfirm(item.id, item.storagePath)
    // Close after short delay so the user sees the item disappear from the grid
    setTimeout(() => { onReset(); onClose() }, 400)
  }

  if (!isOpen || !item) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !isBusy) handleClose() }}
      role="presentation"
    >
      <div
        className="modal-panel modal-panel--narrow"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="delete-dialog-title" className="modal-title modal-title--danger">
            <Trash2 size={16} aria-hidden="true" />
            Delete Image
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="modal-close-btn"
            aria-label="Cancel and close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Thumbnail + name */}
          <div className="delete-preview">
            <img
              src={item.downloadURL}
              alt={item.altText}
              className="delete-preview-thumb"
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="delete-preview-title">{item.title}</p>
              <p className="delete-preview-sub">{item.storagePath.split('/').pop()}</p>
            </div>
          </div>

          {/* Warning */}
          <div id="delete-dialog-desc" className="delete-warning">
            <AlertTriangle size={16} className="delete-warning-icon" aria-hidden="true" />
            <p>
              This will <strong>permanently delete</strong> this image from the gallery and
              Firebase Storage. This action cannot be undone.
            </p>
          </div>

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
          <button
            ref={cancelRef}
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="cms-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-confirm-btn"
            onClick={handleConfirm}
            disabled={isBusy}
            className="cms-btn-danger"
          >
            {isBusy ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Deleting…</>
            ) : (
              <><Trash2 size={14} aria-hidden="true" />Delete permanently</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
