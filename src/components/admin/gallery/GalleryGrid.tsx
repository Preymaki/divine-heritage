/**
 * GalleryGrid
 *
 * Responsive image grid for the admin gallery page.
 *
 * Items are grouped and displayed under labelled section headers that
 * mirror the 4 sections on the public /gallery page, so the admin can
 * clearly see which section each editable slot belongs to.
 *
 * Section order matches GALLERY_GROUP_ORDER exactly.
 */

import { Images } from 'lucide-react'
import type { GalleryItem, GalleryGroup } from '@appTypes/gallery'
import { GALLERY_GROUP_ORDER, GALLERY_GROUP_LABELS, GALLERY_GROUP_SUBTITLES } from '@appTypes/gallery'
import GalleryCard from './GalleryCard'
import EmptyState from '@components/admin/EmptyState'

// ── Section colour accents — one per group ──────────────────────────────────
const GROUP_COLORS: Record<GalleryGroup, string> = {
  home_hero:     '#1e56d0', // primary blue
  home_about:    '#e0289b', // accent pink
  home_cta:      '#6b9e7a', // sage
  about_page:    '#8b5cf6', // purple
  services_page: '#d97706', // amber
  outings:       '#6366f1', // indigo
  library:       '#0ea5e9', // sky
  learning:      '#10b981', // emerald
  indoor:        '#ec4899', // pink
  other:         '#64748b', // slate
}

// ── Section location badges ─────────────────────────────────────────
const SECTION_NUMBERS: Partial<Record<GalleryGroup, string>> = {
  home_hero:     'Home Page',
  home_about:    'Home Page',
  home_cta:      'Home & Global',
  about_page:    'About Page',
  services_page: 'Services Page',
  outings:       'Gallery S1',
  library:       'Gallery S2',
  learning:      'Gallery S3',
  indoor:        'Gallery S4',
}

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
    <div className="gallery-sections-wrap" aria-busy="true" aria-label="Loading gallery">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="gallery-section">
          <div className="gallery-section-header">
            <div className="gallery-skeleton-line gallery-skeleton-line--title" style={{ width: 140 }} />
          </div>
          <div className="gallery-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="gallery-card gallery-card--skeleton">
                <div className="gallery-card-img-wrap gallery-skeleton-img" />
                <div className="gallery-card-meta">
                  <div className="gallery-skeleton-line gallery-skeleton-line--title" />
                  <div className="gallery-skeleton-line gallery-skeleton-line--sub" />
                </div>
              </div>
            ))}
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

  // Group items by gallery group
  const grouped = GALLERY_GROUP_ORDER.reduce<Record<GalleryGroup, GalleryItem[]>>(
    (acc, g) => {
      acc[g] = items.filter((item) => item.group === g).sort((a, b) => a.sortOrder - b.sortOrder)
      return acc
    },
    {
      home_hero: [],
      home_about: [],
      home_cta: [],
      about_page: [],
      services_page: [],
      outings: [],
      library: [],
      learning: [],
      indoor: [],
      other: [],
    },
  )

  const totalPublished = items.filter((i) => i.isPublished).length

  return (
    <div className="gallery-sections-wrap">
      {/* Summary bar */}
      <p className="gallery-count">
        {items.length} image{items.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
        {totalPublished} published &nbsp;·&nbsp;
        {items.length - totalPublished} draft
      </p>

      {/* Render each section */}
      {GALLERY_GROUP_ORDER.map((group) => {
        const groupItems = grouped[group]
        const color      = GROUP_COLORS[group]
        const sectionNum = SECTION_NUMBERS[group]
        const label      = GALLERY_GROUP_LABELS[group]
        const subtitle   = GALLERY_GROUP_SUBTITLES[group]

        // Don't render the "other" group header if it's empty
        if (group === 'other' && groupItems.length === 0) return null

        return (
          <div key={group} className="gallery-section" id={`gallery-section-${group}`}>
            {/* Section header */}
            <div className="gallery-section-header">
              <div
                className="gallery-section-accent"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div className="gallery-section-heading">
                <div className="gallery-section-title-row">
                  {sectionNum && (
                    <span
                      className="gallery-section-number"
                      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
                    >
                      {sectionNum}
                    </span>
                  )}
                  <h2 className="gallery-section-title">{label}</h2>
                  <span className="gallery-section-count">
                    {groupItems.length} image{groupItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {subtitle && (
                  <p className="gallery-section-subtitle">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Images in this section */}
            {groupItems.length === 0 ? (
              <p className="gallery-section-empty">
                No images in this section yet.
              </p>
            ) : (
              <div className="gallery-grid" role="list" aria-label={`${label} images`}>
                {groupItems.map((item) => (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
