import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants'
import type { ActivePiece, Cell, PieceType } from '../types'
import { getShape } from './tetrominos'

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array<Cell>(BOARD_WIDTH).fill(null),
  )
}

export function isValidPosition(
  board: Cell[][],
  piece: ActivePiece,
  offsetX = 0,
  offsetY = 0,
  rotation?: number,
): boolean {
  const shape = getShape(piece.type, rotation ?? piece.rotation)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = piece.x + c + offsetX
      const y = piece.y + r + offsetY
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false
      if (y >= 0 && board[y][x]) return false
    }
  }
  return true
}

export function mergePiece(board: Cell[][], piece: ActivePiece): Cell[][] {
  const newBoard = board.map((row) => [...row])
  const shape = getShape(piece.type, piece.rotation)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = piece.x + c
      const y = piece.y + r
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newBoard[y][x] = piece.type
      }
    }
  }
  return newBoard
}

export function clearLines(board: Cell[][]): { board: Cell[][]; linesCleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null))
  const linesCleared = BOARD_HEIGHT - remaining.length
  const emptyRows = Array.from({ length: linesCleared }, () =>
    Array<Cell>(BOARD_WIDTH).fill(null),
  )
  return { board: [...emptyRows, ...remaining], linesCleared }
}

export function getGhostY(board: Cell[][], piece: ActivePiece): number {
  let ghostY = piece.y
  while (isValidPosition(board, piece, 0, ghostY - piece.y + 1)) {
    ghostY++
  }
  return ghostY
}

export function isGameOver(board: Cell[][], piece: ActivePiece): boolean {
  return !isValidPosition(board, piece)
}

export function getPieceCells(
  piece: ActivePiece,
  yOverride?: number,
): { x: number; y: number; type: PieceType }[] {
  const cells: { x: number; y: number; type: PieceType }[] = []
  const shape = getShape(piece.type, piece.rotation)
  const y = yOverride ?? piece.y
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        cells.push({ x: piece.x + c, y: y + r, type: piece.type })
      }
    }
  }
  return cells
}
