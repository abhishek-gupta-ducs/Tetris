import { DigitalStatCard } from './DigitalStatCard'

type StatsPanelProps = {
  score: number
  lines: number
  level: number
  highScore: number
  variant: 'primary' | 'secondary'
}

export function StatsPanel({
  score,
  lines,
  level,
  highScore,
  variant,
}: StatsPanelProps) {
  if (variant === 'primary') {
    return (
      <div className="stats-panel">
        <DigitalStatCard label="Score" value={score} statKey="score" />
        <DigitalStatCard label="Lines" value={lines} statKey="lines" />
      </div>
    )
  }

  return (
    <div className="stats-panel">
      <DigitalStatCard label="Level" value={level} statKey="level" />
      <DigitalStatCard label="High Score" value={highScore} statKey="highScore" />
    </div>
  )
}
