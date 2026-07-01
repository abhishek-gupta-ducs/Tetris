import {
  formatStatDigits,
  STAT_DIGIT_COUNT,
  STAT_DISPLAY_LIMITS,
} from '../utils/displayStats'

type StatKey = keyof typeof STAT_DISPLAY_LIMITS

type SevenSegmentDisplayProps = {
  value: number
  statKey: StatKey
  label: string
}

export function SevenSegmentDisplay({
  value,
  statKey,
  label,
}: SevenSegmentDisplayProps) {
  const digits = formatStatDigits(value, statKey)

  return (
    <div
      className="seven-segment-display"
      role="img"
      aria-label={`${label}: ${value}`}
    >
      {digits.map((digit, index) => (
        <span
          key={`${statKey}-${index}`}
          className={`seven-segment-digit${
            digit.active ? ' is-active' : ' is-inactive'
          }`}
          aria-hidden="true"
        >
          {digit.char}
        </span>
      ))}
      <span className="sr-only">{value.toString().padStart(STAT_DIGIT_COUNT, '0')}</span>
    </div>
  )
}
