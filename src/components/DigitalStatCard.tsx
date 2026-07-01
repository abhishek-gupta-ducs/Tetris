import { STAT_DISPLAY_LIMITS } from '../utils/displayStats'
import { SevenSegmentDisplay } from './SevenSegmentDisplay'

type StatKey = keyof typeof STAT_DISPLAY_LIMITS

type DigitalStatCardProps = {
  label: string
  value: number
  statKey: StatKey
}

export function DigitalStatCard({ label, value, statKey }: DigitalStatCardProps) {
  return (
    <div className="digital-stat-card">
      <span className="digital-stat-label">{label}</span>
      <SevenSegmentDisplay value={value} statKey={statKey} label={label} />
    </div>
  )
}
