import { DIFFICULTY_CONFIG } from '../constants'
import type { Difficulty } from '../types'

const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
}

export function calculateLineScore(linesCleared: number, level: number): number {
  if (linesCleared <= 0) return 0
  const base = LINE_SCORES[linesCleared] ?? LINE_SCORES[4]
  return base * level
}

export function calculateLevel(totalLines: number, difficulty: Difficulty): number {
  const { linesPerLevel } = DIFFICULTY_CONFIG[difficulty]
  return Math.floor(totalLines / linesPerLevel) + 1
}

export function getFallSpeed(level: number, difficulty: Difficulty): number {
  const { baseSpeed, speedStep, minSpeed } = DIFFICULTY_CONFIG[difficulty]
  return Math.max(minSpeed, baseSpeed - (level - 1) * speedStep)
}

const MUSIC_INTERVAL_MIN = 88
const MUSIC_INTERVAL_MAX = 400

export function getMusicIntervalFromFallSpeed(fallSpeedMs: number): number {
  const slowestFall = Math.max(
    ...Object.values(DIFFICULTY_CONFIG).map((config) => config.baseSpeed),
  )
  const fastestFall = Math.min(
    ...Object.values(DIFFICULTY_CONFIG).map((config) => config.minSpeed),
  )
  const clamped = Math.max(fastestFall, Math.min(slowestFall, fallSpeedMs))
  const slowFactor = (clamped - fastestFall) / (slowestFall - fastestFall)
  return Math.round(
    MUSIC_INTERVAL_MIN + slowFactor * (MUSIC_INTERVAL_MAX - MUSIC_INTERVAL_MIN),
  )
}
