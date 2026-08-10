/**
 * AdminReviews — /admin/reviews
 *
 * Reviews CMS placeholder. Will support approving, featuring,
 * and hiding parent reviews in a future milestone.
 */

import { Star } from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'

export default function AdminReviews() {
  return (
    <div className="cms-page">
      <PageHeader
        title="Reviews"
        subtitle="Moderate and feature parent reviews displayed on the website."
      />

      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="Reviews submitted through the public site will appear here for moderation. You'll be able to approve, feature, or hide individual reviews once Firestore is connected."
      />
    </div>
  )
}
