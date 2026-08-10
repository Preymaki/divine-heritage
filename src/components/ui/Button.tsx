import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
  fullWidth?: boolean
  id?: string
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
    href?: never
  }

type LinkButtonProps = BaseProps &
  Omit<LinkProps, 'children'> & {
    as: 'link'
    href: string
    type?: never
  }

type ExternalLinkProps = BaseProps & {
  as: 'a'
  href: string
  target?: string
  rel?: string
  type?: never
}

type Props = ButtonProps | LinkButtonProps | ExternalLinkProps

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5',
  secondary:
    'bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5',
  outline:
    'border-2 border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] hover:-translate-y-0.5',
  ghost:
    'text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
}

function getClasses(variant: Variant, size: Size, fullWidth: boolean, className: string) {
  return [
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-2 focus-visible:outline-[var(--color-primary-500)] focus-visible:outline-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Polymorphic Button component.
 * Use as="link" for internal React Router links.
 * Use as="a" for external links.
 * Default is a <button> element.
 */
export default function Button(props: Props) {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    fullWidth = false,
    id,
  } = props

  const classes = getClasses(variant, size, fullWidth, className)

  if (props.as === 'link') {
    const { as: _as, href, ...rest } = props
    return (
      <Link to={href} className={classes} id={id} {...(rest as Omit<LinkProps, 'to' | 'children'>)}>
        {children}
      </Link>
    )
  }

  if (props.as === 'a') {
    const { href, target, rel } = props
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={classes}
        id={id}
      >
        {children}
      </a>
    )
  }

  const { as: _as, ...rest } = props as ButtonProps
  return (
    <button className={classes} id={id} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
