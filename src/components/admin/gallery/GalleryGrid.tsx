/**
 * GalleryGrid
 *
 * Responsive image grid for the admin gallery page.
 * Shows skeleton while loading, EmptyState when empty, cards otherwise.
 */

import { Images } from 'lucide-react'
import type { GalleryItem } from '@appTypes/gallery'
import GalleryCard from './GalleryCard'
import EmptyState from '@components/admin/EmptyState'

interface GalleryGridProps {
  items: GalleryItem[]
  loading: boolean
  isActionPending: boolean
  onUploadClick?:      (() => void) | undefined
  onEdit:              (item: GalleryItem) => void
  onDelete?:           ((item: GalleryItem) => void) | undefined
  onTogglePublish:     (item: GalleryItem) => void
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function GallerySkeleton() {
  return (
    <div className="gallery-grid" aria-busy="true" aria-label="Loading gallery">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="gallery-card gallery-card--skeleton">
          <div className="gallery-card-img-wrap gallery-skeleton-img" />
          <div className="gallery-card-meta">
            <div className="gallery-skeleton-line gallery-skeleton-line--title" />
            <div className="gallery-skeleton-line gallery-skeleton-line--sub" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Grid ──────────────────────────────────────────────────────────────────────

export default function GalleryGrid({
  items,
  loading,
  isActionPending,
  onUploadClick,
  onEdit,
  onDelete,
  onTogglePublish,
}: GalleryGridProps) {
  if (loading) return <GallerySkeleton />

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title="No images yet"
        description="Seed the gallery using the button above to import all existing website photos."
        action={onUploadClick ? (
          <button
            type="button"
            id="gallery-empty-upload-btn"
            onClick={onUploadClick}
            className="cms-btn-primary"
          >
            Upload your first image
          </button>
        ) : undefined}
      />
    )
  }

  return (
    <div>
      <p className="gallery-count">
        {items.length} image{items.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
        {items.filter(i => i.isPublished).length} published &nbsp;·&nbsp;
        {items.filter(i => !i.isPublished).length} draft
      </p>
      <div className="gallery-grid" role="list" aria-label="Gallery images">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <GalleryCard
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              isActionPending={isActionPending}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
