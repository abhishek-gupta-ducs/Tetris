import { useCallback, useEffect, useRef, useState } from 'react'
import { WALL_KICK_OFFSETS } from '../constants'
import type { ActivePiece, Difficulty, GameState, PieceType } from '../types'
import {
  clearLines,
  createEmptyBoard,
  getGhostY,
  isGameOver,
  isValidPosition,
  mergePiece,
} from '../utils/board'
import {
  calculateLevel,
  calculateLineScore,
  getFallSpeed,
} from '../utils/scoring'
import { getSpawnPosition, nextFromBag, resetBag } from '../utils/tetrominos'

export type SoundCallbacks = {
  onMove?: () => void
  onRotate?: () => void
  onLock?: () => void
  onLineClear?: (lines: number) => void
  onGameOver?: () => void
}

type UseTetrisOptions = {
  sounds?: SoundCallbacks
  initialHighScore?: number
  onHighScoreSave?: (score: number) => void
}

function spawnPiece(type: PieceType): ActivePiece {
  const { x, y } = getSpawnPosition(type)
  return { type, rotation: 0, x, y }
}

function createInitialState(highScore = 0): GameState {
  resetBag()
  const next = nextFromBag()
  return {
    board: createEmptyBoard(),
    active: null,
    next,
    score: 0,
    lines: 0,
    level: 1,
    highScore,
    status: 'idle',
  }
}

export function useTetris(difficulty: Difficulty, options: UseTetrisOptions = {}) {
  const { sounds, initialHighScore = 0, onHighScoreSave } = options

  const [state, setState] = useState<GameState>(() =>
    createInitialState(initialHighScore),
  )
  const stateRef = useRef(state)
  stateRef.current = state

  const soundsRef = useRef(sounds)
  soundsRef.current = sounds

  const onHighScoreSaveRef = useRef(onHighScoreSave)
  onHighScoreSaveRef.current = onHighScoreSave

  const difficultyRef = useRef(difficulty)
  difficultyRef.current = difficulty

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearGameInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const maybeSaveHighScore = useCallback((score: number, currentHigh: number) => {
    const newHigh = Math.max(currentHigh, score)
    if (newHigh > currentHigh) {
      onHighScoreSaveRef.current?.(newHigh)
    }
    return newHigh
  }, [])

  const lockPiece = useCallback(
    (current: GameState): GameState => {
      if (!current.active) return current

      soundsRef.current?.onLock?.()

      let board = mergePiece(current.board, current.active)
      const { board: clearedBoard, linesCleared } = clearLines(board)
      board = clearedBoard

      if (linesCleared > 0) {
        soundsRef.current?.onLineClear?.(linesCleared)
      }

      const newLines = current.lines + linesCleared
      const newLevel = calculateLevel(newLines, difficultyRef.current)
      const lineScore = calculateLineScore(linesCleared, current.level)
      const newScore = current.score + lineScore
      const newHighScore = maybeSaveHighScore(newScore, current.highScore)

      const nextType = current.next
      const upcoming = nextFromBag()
      const active = spawnPiece(nextType)

      if (isGameOver(board, active)) {
        soundsRef.current?.onGameOver?.()
        return {
          ...current,
          board,
          active: null,
          next: upcoming,
          score: newScore,
          lines: newLines,
          level: newLevel,
          highScore: newHighScore,
          status: 'gameover',
        }
      }

      return {
        ...current,
        board,
        active,
        next: upcoming,
        score: newScore,
        lines: newLines,
        level: newLevel,
        highScore: newHighScore,
        status: 'playing',
      }
    },
    [maybeSaveHighScore],
  )

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || !prev.active) return prev

      const moved = { ...prev.active, y: prev.active.y + 1 }
      if (isValidPosition(prev.board, moved)) {
        return { ...prev, active: moved }
      }

      return lockPiece(prev)
    })
  }, [lockPiece])

  const startInterval = useCallback(
    (level: number) => {
      clearGameInterval()
      intervalRef.current = setInterval(
        tick,
        getFallSpeed(level, difficultyRef.current),
      )
    },
    [clearGameInterval, tick],
  )

  const startGame = useCallback(() => {
    resetBag()
    const first = nextFromBag()
    const second = nextFromBag()
    const active = spawnPiece(first)

    setState((prev) => ({
      board: createEmptyBoard(),
      active,
      next: second,
      score: 0,
      lines: 0,
      level: 1,
      highScore: prev.highScore,
      status: 'playing',
    }))
  }, [])

  const restart = useCallback(() => {
    clearGameInterval()
    startGame()
  }, [clearGameInterval, startGame])

  const returnToIdle = useCallback(() => {
    clearGameInterval()
    setState((prev) => ({
      ...createInitialState(prev.highScore),
      highScore: prev.highScore,
    }))
  }, [clearGameInterval])

  const endGame = useCallback(() => {
    clearGameInterval()
    setState((prev) => {
      if (prev.status !== 'playing' && prev.status !== 'paused') return prev
      soundsRef.current?.onGameOver?.()
      const newHighScore = maybeSaveHighScore(prev.score, prev.highScore)
      return {
        ...prev,
        active: null,
        highScore: newHighScore,
        status: 'gameover',
      }
    })
  }, [clearGameInterval, maybeSaveHighScore])

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      clearGameInterval()
      return { ...prev, status: 'paused' }
    })
  }, [clearGameInterval])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused') return prev
      return { ...prev, status: 'playing' }
    })
  }, [])

  const move = useCallback((dx: number) => {
    setState((prev) => {
      if (prev.status !== 'playing' || !prev.active) return prev
      const moved = { ...prev.active, x: prev.active.x + dx }
      if (!isValidPosition(prev.board, moved)) return prev
      soundsRef.current?.onMove?.()
      return { ...prev, active: moved }
    })
  }, [])

  const softDrop = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || !prev.active) return prev
      const moved = { ...prev.active, y: prev.active.y + 1 }
      if (!isValidPosition(prev.board, moved)) {
        return lockPiece(prev)
      }
      return { ...prev, active: moved }
    })
  }, [lockPiece])

  const rotate = useCallback((direction: 1 | -1 = 1) => {
    setState((prev) => {
      if (prev.status !== 'playing' || !prev.active) return prev
      const shapeCount = 4
      const newRotation =
        (prev.active.rotation + direction + shapeCount) % shapeCount

      for (const [offsetX, offsetY] of WALL_KICK_OFFSETS) {
        if (
          isValidPosition(
            prev.board,
            prev.active,
            offsetX,
            offsetY,
            newRotation,
          )
        ) {
          soundsRef.current?.onRotate?.()
          return {
            ...prev,
            active: {
              ...prev.active,
              rotation: newRotation,
              x: prev.active.x + offsetX,
              y: prev.active.y + offsetY,
            },
          }
        }
      }
      return prev
    })
  }, [])

  useEffect(() => {
    setState((prev) => ({ ...prev, highScore: initialHighScore }))
  }, [initialHighScore])

  useEffect(() => {
    if (state.status === 'playing') {
      startInterval(state.level)
    } else {
      clearGameInterval()
    }
    return clearGameInterval
  }, [state.status, state.level, startInterval, clearGameInterval])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const gameKeys = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowDown',
        'a',
        'A',
        'd',
        'D',
        's',
        'S',
        ' ',
        'p',
        'P',
        'r',
        'R',
      ]

      const current = stateRef.current
      if (current.status === 'idle') return

      if (gameKeys.includes(key)) {
        e.preventDefault()
      }

      if (key === 'p' || key === 'P') {
        if (current.status === 'playing') pause()
        return
      }

      if (key === 'r' || key === 'R') {
        if (current.status === 'paused') resume()
        return
      }

      if (current.status !== 'playing') return

      switch (key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move(-1)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          move(1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          softDrop()
          break
        case ' ':
          rotate(1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move, softDrop, rotate, pause, resume])

  const ghostY =
    state.active && state.status === 'playing'
      ? getGhostY(state.board, state.active)
      : null

  return {
    ...state,
    ghostY,
    start: startGame,
    restart,
    returnToIdle,
    endGame,
    pause,
    resume,
    move,
    softDrop,
    rotate,
  }
}
