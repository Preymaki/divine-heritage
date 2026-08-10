import { type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  once?: boolean
  role?: string
}

/**
 * Wraps children in a Framer Motion fade+slide animation
 * that triggers when the element enters the viewport.
 *
 * Fully respects the OS `prefers-reduced-motion` setting —
 * when reduced motion is preferred, elements appear instantly with no movement.
 */
export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.55,
  once = true,
  role,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-60px' })
  const prefersReducedMotion = useReducedMotion()

  // When reduced motion is preferred, show content immediately with no transform
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} role={role}>
        {children}
      </div>
    )
  }

  const offsetMap = {
    up: { y: 28, x: 0 },
    down: { y: -28, x: 0 },
    left: { x: 28, y: 0 },
    right: { x: -28, y: 0 },
    none: { x: 0, y: 0 },
  }

  const offset = offsetMap[direction]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...offset }
      }
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
      role={role}
    >
      {children}
    </motion.div>
  )
}
