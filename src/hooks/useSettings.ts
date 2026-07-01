import { useCallback, useState } from 'react'
import { SETTINGS_KEY } from '../constants'
import type { Difficulty, Settings } from '../types'

const DEFAULT_SETTINGS: Settings = {
  difficulty: 'intermediate',
  soundEnabled: true,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      difficulty: parsed.difficulty ?? DEFAULT_SETTINGS.difficulty,
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore storage errors
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const setDifficulty = useCallback(
    (difficulty: Difficulty) => updateSettings({ difficulty }),
    [updateSettings],
  )

  const setSoundEnabled = useCallback(
    (soundEnabled: boolean) => updateSettings({ soundEnabled }),
    [updateSettings],
  )

  return { settings, setDifficulty, setSoundEnabled, updateSettings }
}
