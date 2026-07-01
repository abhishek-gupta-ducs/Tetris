export type DailyLeaderboardEntry = {
  rank: number
  uid: string
  displayName: string
  score: number
}

export function getTodayKeyUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDailyLeaderboardDate(dateKey = getTodayKeyUTC()): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
