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
import { Sparkles, RefreshCw } from 'lucide-react'
import { useGallery } from '@hooks/useGallery'
import { GALLERY_GROUP_ORDER } from '@appTypes/gallery'
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

  // Check if any group from GALLERY_GROUP_ORDER has no items in Firestore
  const missingGroupCount = GALLERY_GROUP_ORDER.filter(
    (group) => !items.some((item) => item.group === group)
  ).length

  const showSeedBanner = !loading && !error && (items.length === 0 || missingGroupCount > 0)

  return (
    <div className="cms-page">
      {/* ── Header with Sync button ── */}
      <PageHeader
        title="Gallery"
        subtitle="Click any image card to swap or edit it. All 27 picture slots across Home, About, Services, CTA, and Public Gallery are listed below."
        action={
          <button
            type="button"
            id="gallery-header-sync-btn"
            onClick={seedItems}
            disabled={isSeedPending || seedState.phase === 'success'}
            className="cms-btn-secondary"
            title="Import or sync missing picture slots into Firestore"
          >
            {isSeedPending ? (
              <><span className="admin-btn-spinner" aria-hidden="true" />Syncing…</>
            ) : (
              <><RefreshCw size={14} aria-hidden="true" />Sync Picture Slots</>
            )}
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

      {/* ── Seed / Sync banner ── */}
      {showSeedBanner && (
        <div className="admin-seed-banner" role="region" aria-label="Gallery initialisation">
          <div className="admin-seed-banner-icon">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div className="admin-seed-banner-body">
            <p className="admin-seed-banner-title">
              {items.length === 0 ? 'Initialise gallery from website images' : 'Sync missing website picture slots'}
            </p>
            <p className="admin-seed-banner-desc">
              {items.length === 0
                ? 'Your gallery is empty. Click below to import all existing website photos into the gallery so you can manage them.'
                : `${missingGroupCount} section(s) have not been initialised in Firestore yet. Click below to import the default photos for Home, About, Services, and CTA page picture slots.`
              }
            </p>
            {seedState.phase === 'error' && seedState.error && (
              <p className="admin-seed-banner-error" role="alert">{seedState.error}</p>
            )}
            {seedState.phase === 'success' && (
              <p className="admin-seed-banner-success" role="status">
                Picture slots synced successfully! All sections will now display their photos.
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
              <><span className="admin-btn-spinner" aria-hidden="true" />Syncing Slots…</>
            ) : (
              <><Sparkles size={15} aria-hidden="true" />Import / Sync Slots</>
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
