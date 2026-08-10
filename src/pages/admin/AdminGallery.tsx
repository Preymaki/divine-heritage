/**
 * AdminGallery — /admin/gallery
 *
 * Full Gallery CMS page. Manages:
 *  - Upload modal
 *  - Edit modal
 *  - Delete confirmation dialog
 *  - Publish/unpublish toggle (inline, no modal)
 *
 * All state operations are delegated to the useGallery hook.
 */

import { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { useGallery } from '@hooks/useGallery'
import type { GalleryItem } from '@appTypes/gallery'
import PageHeader from '@components/admin/PageHeader'
import GalleryGrid from '@components/admin/gallery/GalleryGrid'
import UploadModal from '@components/admin/gallery/UploadModal'
import EditModal from '@components/admin/gallery/EditModal'
import DeleteConfirmDialog from '@components/admin/gallery/DeleteConfirmDialog'

export default function AdminGallery() {
  const {
    items, loading, error,
    uploadState, actionState,
    uploadImage, updateItem, deleteItem, togglePublish,
    resetUpload, resetAction,
  } = useGallery()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isUploadOpen,      setIsUploadOpen]      = useState(false)
  const [itemToEdit,        setItemToEdit]         = useState<GalleryItem | null>(null)
  const [itemToDelete,      setItemToDelete]       = useState<GalleryItem | null>(null)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenEdit   = useCallback((item: GalleryItem) => { resetAction(); setItemToEdit(item) },   [resetAction])
  const handleOpenDelete = useCallback((item: GalleryItem) => { resetAction(); setItemToDelete(item) }, [resetAction])

  const handleConfirmDelete = useCallback(async (id: string, storagePath: string) => {
    await deleteItem(id, storagePath)
  }, [deleteItem])

  const isActionPending = actionState.phase === 'pending'

  return (
    <div className="cms-page">
      {/* ── Header ── */}
      <PageHeader
        title="Gallery"
        subtitle="Manage photos displayed on the public gallery page."
        action={
          <button
            type="button"
            id="gallery-upload-btn"
            onClick={() => setIsUploadOpen(true)}
            className="cms-btn-primary"
          >
            <Upload size={15} aria-hidden="true" />
            Upload Images
          </button>
        }
      />

      {/* ── Firestore error banner ── */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <strong>Could not load gallery:</strong> {error}
          <br />
          <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
            Check your Firestore Security Rules — authenticated writes to{' '}
            <code>gallery/**</code> must be allowed.
          </span>
        </div>
      )}

      {/* ── Gallery grid ── */}
      <GalleryGrid
        items={items}
        loading={loading}
        isActionPending={isActionPending}
        onUploadClick={() => setIsUploadOpen(true)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePublish={togglePublish}
      />

      {/* ── Upload modal ── */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadImage}
        uploadState={uploadState}
        onReset={resetUpload}
      />

      {/* ── Edit modal ── */}
      <EditModal
        item={itemToEdit}
        isOpen={itemToEdit !== null}
        onClose={() => setItemToEdit(null)}
        onSave={updateItem}
        actionState={actionState}
        onReset={resetAction}
      />

      {/* ── Delete confirmation ── */}
      <DeleteConfirmDialog
        item={itemToDelete}
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        actionState={actionState}
        onReset={resetAction}
      />
    </div>
  )
}
