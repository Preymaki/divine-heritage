/**
 * AdminGallery — /admin/gallery
 *
 * Full Gallery CMS page. Manages:
 *  - Seed button (shown only when gallery is empty — one-time initialisation)
 *  - Upload modal
 *  - Edit modal
 *  - Delete confirmation dialog
 *  - Publish/unpublish toggle (inline, no modal)
 *
 * All state operations are delegated to the useGallery hook.
 */

import { useState, useCallback } from 'react'
import { Upload, Sparkles } from 'lucide-react'
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
    uploadState, actionState, seedState,
    uploadImage, updateItem, deleteItem, togglePublish, seedItems,
    resetUpload, resetAction,
  } = useGallery()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isUploadOpen,  setIsUploadOpen]  = useState(false)
  const [itemToEdit,    setItemToEdit]    = useState<GalleryItem | null>(null)
  const [itemToDelete,  setItemToDelete]  = useState<GalleryItem | null>(null)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenEdit   = useCallback((item: GalleryItem) => { resetAction(); setItemToEdit(item) },   [resetAction])
  const handleOpenDelete = useCallback((item: GalleryItem) => { resetAction(); setItemToDelete(item) }, [resetAction])

  const handleConfirmDelete = useCallback(async (id: string, storagePath: string | null) => {
    await deleteItem(id, storagePath)
  }, [deleteItem])

  const isActionPending = actionState.phase === 'pending'
  const isSeedPending   = seedState.phase === 'pending'

  // Only show the seed banner when loading is done and there are no items
  const showSeedBanner = !loading && !error && items.length === 0

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
            Upload Image
          </button>
        }
      />

      {/* ── Firestore error banner ── */}
      {error && (
        <div role="alert" className="admin-error-banner">
          <strong>Could not load gallery:</strong> {error}
          <br />
          <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
            Check your Firestore Security Rules — authenticated reads from{' '}
            <code>gallery/**</code> must be allowed.
          </span>
        </div>
      )}

      {/* ── Seed banner — shown once when gallery is empty ── */}
      {showSeedBanner && (
        <div className="admin-seed-banner" role="region" aria-label="Gallery initialisation">
          <div className="admin-seed-banner-icon">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div className="admin-seed-banner-body">
            <p className="admin-seed-banner-title">Initialise gallery from existing website images</p>
            <p className="admin-seed-banner-desc">
              Your gallery is empty. Click below to import all 19 existing website photos into
              the gallery so you can manage them from the admin dashboard. This only needs to be
              done once.
            </p>
            {seedState.phase === 'error' && seedState.error && (
              <p className="admin-seed-banner-error" role="alert">{seedState.error}</p>
            )}
            {seedState.phase === 'success' && (
              <p className="admin-seed-banner-success" role="status">
                Gallery seeded successfully! The images will appear momentarily.
              </p>
            )}
          </div>
          <button
            type="button"
            id="gallery-seed-btn"
            onClick={seedItems}
            disabled={isSeedPending || seedState.phase === 'success'}
            className="cms-btn-primary admin-seed-btn"
          >
            {isSeedPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Seeding…</>
            ) : (
              <><Sparkles size={15} aria-hidden="true" />Import Existing Images</>
            )}
          </button>
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
