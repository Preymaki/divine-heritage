/**
 * GalleryCard
 *
 * A single image tile in the admin gallery grid.
 * Shows thumbnail, title, published/draft badge, alt text, date.
 * Action buttons: Edit, Publish/Unpublish toggle, Delete.
 */

import type { GalleryItem } from '@appTypes/gallery'
import { Eye, EyeOff, Calendar, Pencil, Trash2 } from 'lucide-react'

interface GalleryCardProps {
  item: GalleryItem
  onEdit:   (item: GalleryItem) => void
  onDelete: (item: GalleryItem) => void
  onTogglePublish: (item: GalleryItem) => void
  /** Disable action buttons when another action is in-flight */
  isActionPending?: boolean
}

function formatDate(ts: GalleryItem['createdAt']): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GalleryCard({
  item,
  onEdit,
  onDelete,
  onTogglePublish,
  isActionPending = false,
}: GalleryCardProps) {
  return (
    <article className="gallery-card" aria-label={item.title}>
      {/* Image */}
      <div className="gallery-card-img-wrap">
        <img
          src={item.downloadURL}
          alt={item.altText}
          className="gallery-card-img"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Published / Draft badge */}
        <div className={`gallery-card-badge ${item.isPublished ? 'gallery-card-badge--published' : 'gallery-card-badge--draft'}`}>
          {item.isPublished
            ? <><Eye size={11} aria-hidden="true" /> Published</>
            : <><EyeOff size={11} aria-hidden="true" /> Draft</>
          }
        </div>
      </div>

      {/* Meta */}
      <div className="gallery-card-meta">
        <p className="gallery-card-title" title={item.title}>{item.title}</p>
        {item.altText && (
          <p className="gallery-card-alt" title={item.altText}>
            Alt: {item.altText}
          </p>
        )}
        <p className="gallery-card-date">
          <Calendar size={11} aria-hidden="true" />
          {formatDate(item.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="gallery-card-actions">
        {/* Edit */}
        <button
          type="button"
          onClick={() => onEdit(item)}
          disabled={isActionPending}
          className="gallery-action-btn gallery-action-btn--edit"
          aria-label={`Edit ${item.title}`}
          title="Edit metadata"
        >
          <Pencil size={13} aria-hidden="true" />
          Edit
        </button>

        {/* Publish / Unpublish toggle */}
        <button
          type="button"
          onClick={() => onTogglePublish(item)}
          disabled={isActionPending}
          className={`gallery-action-btn ${item.isPublished ? 'gallery-action-btn--unpublish' : 'gallery-action-btn--publish'}`}
          aria-label={item.isPublished ? `Unpublish ${item.title}` : `Publish ${item.title}`}
          title={item.isPublished ? 'Move to drafts' : 'Publish to public gallery'}
        >
          {item.isPublished
            ? <><EyeOff size={13} aria-hidden="true" />Unpublish</>
            : <><Eye size={13} aria-hidden="true" />Publish</>
          }
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={isActionPending}
          className="gallery-action-btn gallery-action-btn--delete"
          aria-label={`Delete ${item.title}`}
          title="Delete image permanently"
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
