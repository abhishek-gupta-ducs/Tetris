import type { PieceType } from '../types'

type ShapeMatrix = number[][]

type TetrominoDef = {
  color: string
  shapes: ShapeMatrix[]
  spawnX: number
  spawnY: number
}

const TETROMINOS: Record<PieceType, TetrominoDef> = {
  I: {
    color: '#00f0f0',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
  },
  O: {
    color: '#f0f000',
    spawnX: 4,
    spawnY: 0,
    shapes: [
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
    ],
  },
  T: {
    color: '#a000f0',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
  },
  S: {
    color: '#00f000',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
      [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
    ],
  },
  Z: {
    color: '#f00000',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
    ],
  },
  J: {
    color: '#0000f0',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
  },
  L: {
    color: '#f0a000',
    spawnX: 3,
    spawnY: 0,
    shapes: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
  },
}

const ALL_PIECES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
export const PREVIEW_GRID_SIZE = 8

let bag: PieceType[] = []

function shuffleBag(): PieceType[] {
  const newBag = [...ALL_PIECES]
  for (let i = newBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newBag[i], newBag[j]] = [newBag[j], newBag[i]]
  }
  return newBag
}

export function nextFromBag(): PieceType {
  if (bag.length === 0) {
    bag = shuffleBag()
  }
  return bag.pop()!
}

export function resetBag(): void {
  bag = []
}

export function getShape(type: PieceType, rotation: number): ShapeMatrix {
  return TETROMINOS[type].shapes[rotation % TETROMINOS[type].shapes.length]
}

export function getSpawnPosition(type: PieceType): { x: number; y: number } {
  return { x: TETROMINOS[type].spawnX, y: TETROMINOS[type].spawnY }
}

export function getPieceColor(type: PieceType): string {
  return TETROMINOS[type].color
}

export function getPreviewGrid(type: PieceType): (PieceType | null)[][] {
  const shape = getShape(type, 0)
  const occupiedCells: [number, number][] = []

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        occupiedCells.push([r, c])
      }
    }
  }

  const minRow = Math.min(...occupiedCells.map(([r]) => r))
  const maxRow = Math.max(...occupiedCells.map(([r]) => r))
  const minCol = Math.min(...occupiedCells.map(([, c]) => c))
  const maxCol = Math.max(...occupiedCells.map(([, c]) => c))
  const pieceRows = maxRow - minRow + 1
  const pieceCols = maxCol - minCol + 1

  const grid: (PieceType | null)[][] = Array.from(
    { length: PREVIEW_GRID_SIZE },
    () => Array(PREVIEW_GRID_SIZE).fill(null),
  )

  const offsetY = Math.ceil((PREVIEW_GRID_SIZE - pieceRows) / 2)
  const offsetX = Math.ceil((PREVIEW_GRID_SIZE - pieceCols) / 2)

  for (const [r, c] of occupiedCells) {
    grid[offsetY + r - minRow][offsetX + c - minCol] = type
  }

  return grid
}
