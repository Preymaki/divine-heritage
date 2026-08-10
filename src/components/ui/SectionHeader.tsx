import { type ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
  className?: string
  titleClassName?: string
  maxWidth?: string
}

/**
 * Reusable section header with optional eyebrow label, title, and subtitle.
 * Used consistently across all sections to maintain typographic hierarchy.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
  className = '',
  titleClassName = '',
  maxWidth = 'max-w-2xl',
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} ${maxWidth} ${className}`}>
      {eyebrow && (
        <p className={`text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)] ${
          light ? 'text-[var(--color-accent-400)]' : 'text-[var(--color-primary-500)]'
        }`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold font-[var(--font-family-heading)] leading-tight tracking-tight ${
          light ? 'text-white' : 'text-[var(--color-text-primary)]'
        } ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base md:text-lg leading-relaxed ${
            light ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Sub-component: inline highlight span
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="text-[var(--color-primary-500)]">{children}</span>
  )
}
