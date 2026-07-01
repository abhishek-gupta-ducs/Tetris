import { useCallback, useEffect, useState } from 'react'
import { fetchDailyLeaderboard } from '../lib/dailyScores'
import {
  formatDailyLeaderboardDate,
  getTodayKeyUTC,
  type DailyLeaderboardEntry,
} from '../utils/dailyLeaderboard'

export function useDailyLeaderboard(open: boolean) {
  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dateKey = getTodayKeyUTC()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDailyLeaderboard(dateKey)
      setEntries(data)
    } catch {
      setError('Could not load today\'s leaderboard. Try again later.')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [dateKey])

  useEffect(() => {
    if (open) {
      void load()
    }
  }, [open, load])

  return {
    entries,
    loading,
    error,
    reload: load,
    dateLabel: formatDailyLeaderboardDate(dateKey),
  }
}
