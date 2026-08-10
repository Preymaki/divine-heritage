/**
 * AdminBlog — /admin/blog
 *
 * Blog CMS placeholder. Will support creating, editing,
 * and publishing blog posts in a future milestone.
 */

import { BookOpen, PenLine } from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import EmptyState from '@components/admin/EmptyState'

export default function AdminBlog() {
  return (
    <div className="cms-page">
      <PageHeader
        title="Blog"
        subtitle="Write and publish articles, news, and updates for families."
        action={
          <button
            type="button"
            id="blog-new-post-btn"
            className="cms-btn-primary"
            disabled
            title="Post editor coming in a future milestone"
          >
            <PenLine size={15} aria-hidden="true" />
            New Post
          </button>
        }
      />

      <EmptyState
        icon={BookOpen}
        title="No blog posts yet"
        description="Share news, tips, and updates with the families you serve. The blog editor and post management tools will be available in a future milestone."
        action={
          <button
            type="button"
            className="cms-btn-secondary"
            disabled
          >
            Write your first post
          </button>
        }
      />
    </div>
  )
}
