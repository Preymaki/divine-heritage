import { type ReactNode, type ElementType } from 'react'

interface SectionWrapperProps {
  children: ReactNode
  id?: string
  className?: string
  as?: ElementType
  background?: 'white' | 'background' | 'muted' | 'primary'
  noPadding?: boolean
}

const backgroundMap = {
  white: 'bg-white',
  background: 'bg-[var(--color-background)]',
  muted: 'bg-[var(--color-muted)]',
  primary: 'bg-[var(--color-primary-900)]',
}

/**
 * Consistent section wrapper with standard padding, max-width, and background.
 * All home page and inner page sections should use this wrapper.
 */
export default function SectionWrapper({
  children,
  id,
  className = '',
  as: Tag = 'section',
  background = 'background',
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <Tag
      id={id}
      className={`${backgroundMap[background]} ${noPadding ? '' : 'section-padding'} ${className}`}
    >
      <div className="container-site">{children}</div>
    </Tag>
  )
}
