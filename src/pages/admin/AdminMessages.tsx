/**
 * AdminMessages — /admin/messages
 *
 * Messages CMS placeholder. Will display contact form
 * submissions from the public site in a future milestone.
 */

import { MessageSquare } from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'

export default function AdminMessages() {
  return (
    <div className="cms-page">
      <PageHeader
        title="Messages"
        subtitle="View and respond to contact form enquiries from families."
      />

      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="When families submit the contact form on your website, their enquiries will appear here. You'll be able to read, reply, and archive messages once Firestore is connected."
      />
    </div>
  )
}
