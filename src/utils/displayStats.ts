import { DIFFICULTY_CONFIG } from '../constants'

/** Worst-case caps used for HUD digit width and leading zeros. */
export const STAT_DISPLAY_LIMITS = {
  score: 9_999_999,
  lines: 999_999,
  level: 999_999,
  highScore: 9_999_999,
} as const

function digitCount(value: number): number {
  return Math.max(1, String(Math.floor(value)).length)
}

export const STAT_DIGIT_COUNT = Math.max(
  digitCount(STAT_DISPLAY_LIMITS.score),
  digitCount(STAT_DISPLAY_LIMITS.lines),
  digitCount(STAT_DISPLAY_LIMITS.level),
  digitCount(STAT_DISPLAY_LIMITS.highScore),
)

/** Highest level reachable before the lines cap on the fastest level curve. */
export function getMaxReachableLevel(): number {
  const minLinesPerLevel = Math.min(
    ...Object.values(DIFFICULTY_CONFIG).map((config) => config.linesPerLevel),
  )
  return Math.floor(STAT_DISPLAY_LIMITS.lines / minLinesPerLevel) + 1
}

export function clampStatValue(
  value: number,
  key: keyof typeof STAT_DISPLAY_LIMITS,
): number {
  const safe = Number.isFinite(value) ? Math.floor(value) : 0
  return Math.min(Math.max(0, safe), STAT_DISPLAY_LIMITS[key])
}

export function formatStatDigits(
  value: number,
  key: keyof typeof STAT_DISPLAY_LIMITS,
): { char: string; active: boolean }[] {
  const clamped = clampStatValue(value, key)
  const digits = clamped.toString().padStart(STAT_DIGIT_COUNT, '0')
  const firstSignificant = digits.search(/[1-9]/)

  return digits.split('').map((char, index) => ({
    char,
    active:
      firstSignificant === -1
        ? index === digits.length - 1
        : index >= firstSignificant,
  }))
}
