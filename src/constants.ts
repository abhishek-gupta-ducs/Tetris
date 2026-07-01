import type { Difficulty } from './types'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const SETTINGS_KEY = 'tetris-settings'

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; baseSpeed: number; speedStep: number; minSpeed: number; linesPerLevel: number }
> = {
  beginner: { label: 'Beginner', baseSpeed: 1500, speedStep: 80, minSpeed: 400, linesPerLevel: 12 },
  easy: { label: 'Easy', baseSpeed: 1200, speedStep: 90, minSpeed: 300, linesPerLevel: 11 },
  intermediate: { label: 'Intermediate', baseSpeed: 1000, speedStep: 100, minSpeed: 100, linesPerLevel: 10 },
  hard: { label: 'Hard', baseSpeed: 700, speedStep: 110, minSpeed: 80, linesPerLevel: 8 },
}

export const PIECE_COLORS: Record<string, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
}

export const WALL_KICK_OFFSETS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-2, 0],
  [2, 0],
]
