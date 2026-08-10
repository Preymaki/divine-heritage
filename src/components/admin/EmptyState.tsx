/**
 * EmptyState
 *
 * Reusable placeholder for CMS sections that have no content yet.
 * Used in Gallery, Reviews, Blog, Messages pages.
 */

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** Optional CTA button or link */
  action?: ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon-wrap" aria-hidden="true">
        <Icon size={36} className="empty-state-icon" />
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
