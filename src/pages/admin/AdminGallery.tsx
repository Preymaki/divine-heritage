/**
 * AdminGallery — /admin/gallery
 *
 * Fixed 18-slot gallery manager.
 *
 * The admin can:
 *  - Click any card → open Edit modal to swap the image or change metadata
 *  - Toggle published/unpublished per image
 *
 * Intentionally removed:
 *  - "Upload Image" button (no adding new slots)
 *  - Delete button (no removing slots)
 *
 * The seed banner is still shown on first-ever load when Firestore is empty.
 */

import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { useGallery } from '@hooks/useGallery'
import type { GalleryItem } from '@appTypes/gallery'
import PageHeader from '@components/admin/PageHeader'
import GalleryGrid from '@components/admin/gallery/GalleryGrid'
import EditModal from '@components/admin/gallery/EditModal'

export default function AdminGallery() {
  const {
    items, loading, error,
    uploadState, actionState, seedState,
    replaceImage, updateItem, togglePublish, seedItems,
    resetUpload, resetAction,
  } = useGallery()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [itemToEdit, setItemToEdit] = useState<GalleryItem | null>(null)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenEdit = useCallback((item: GalleryItem) => {
    resetAction()
    resetUpload()
    setItemToEdit(item)
  }, [resetAction, resetUpload])

  const isSeedPending = seedState.phase === 'pending'

  // Only show the seed banner when loading is done and there are no items
  const showSeedBanner = !loading && !error && items.length === 0

  return (
    <div className="cms-page">
      {/* ── Header (no action button — slots are fixed) ── */}
      <PageHeader
        title="Gallery"
        subtitle="Click any image to swap or edit it. The layout on the public website stays the same."
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
              Your gallery is empty. Click below to import all existing website photos into
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
        isActionPending={actionState.phase === 'pending'}
        onEdit={handleOpenEdit}
        onTogglePublish={togglePublish}
        /* delete disabled — slots are fixed */
        onDelete={undefined}
        onUploadClick={undefined}
      />

      {/* ── Edit modal (includes image swap) ── */}
      <EditModal
        item={itemToEdit}
        isOpen={itemToEdit !== null}
        onClose={() => setItemToEdit(null)}
        onSave={updateItem}
        onReplaceImage={replaceImage}
        actionState={actionState}
        uploadState={uploadState}
        onReset={resetAction}
        onResetUpload={resetUpload}
      />
    </div>
  )
}
