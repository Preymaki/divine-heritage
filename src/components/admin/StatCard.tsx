/**
 * StatCard
 *
 * Reusable summary card for the dashboard home.
 * Displays an icon, label, and a value (placeholder or real).
 */

import type { LucideIcon } from 'lucide-react'

type CardColor = 'blue' | 'pink' | 'sage' | 'amber'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtext?: string
  color?: CardColor
  id?: string
}

const colorMap: Record<CardColor, { card: string; icon: string; iconBg: string }> = {
  blue:  { card: 'stat-card--blue',  icon: 'stat-card-icon--blue',  iconBg: 'stat-card-icon-bg--blue' },
  pink:  { card: 'stat-card--pink',  icon: 'stat-card-icon--pink',  iconBg: 'stat-card-icon-bg--pink' },
  sage:  { card: 'stat-card--sage',  icon: 'stat-card-icon--sage',  iconBg: 'stat-card-icon-bg--sage' },
  amber: { card: 'stat-card--amber', icon: 'stat-card-icon--amber', iconBg: 'stat-card-icon-bg--amber' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'blue',
  id,
}: StatCardProps) {
  const { card, icon, iconBg } = colorMap[color]

  return (
    <div className={`stat-card ${card}`} id={id}>
      <div className={`stat-card-icon-wrap ${iconBg}`}>
        <Icon size={22} className={icon} aria-hidden="true" />
      </div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {subtext && <p className="stat-card-sub">{subtext}</p>}
      </div>
    </div>
  )
}
