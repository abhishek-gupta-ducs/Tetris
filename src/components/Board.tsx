import { BOARD_HEIGHT, BOARD_WIDTH, PIECE_COLORS } from '../constants'
import type { ActivePiece, Cell, PieceType } from '../types'
import { getPieceCells } from '../utils/board'

type BoardProps = {
  board: Cell[][]
  active: ActivePiece | null
  ghostY: number | null
}

function CellBlock({
  type,
  variant = 'filled',
}: {
  type: PieceType | null
  variant?: 'filled' | 'ghost'
}) {
  if (!type) {
    return <div className="cell empty" />
  }

  const color = PIECE_COLORS[type]
  return (
    <div
      className={`cell block ${variant}`}
      style={
        variant === 'ghost'
          ? { borderColor: color, boxShadow: `inset 0 0 0 1px ${color}` }
          : { backgroundColor: color }
      }
    />
  )
}

export function Board({ board, active, ghostY }: BoardProps) {
  const display: Cell[][] = board.map((row) => [...row])

  if (active) {
    if (ghostY !== null && ghostY !== active.y) {
      const ghostCells = getPieceCells(active, ghostY)
      for (const { x, y, type } of ghostCells) {
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          if (!display[y][x]) {
            display[y][x] = type
          }
        }
      }
    }

    const activeCells = getPieceCells(active)
    for (const { x, y, type } of activeCells) {
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        display[y][x] = type
      }
    }
  }

  const ghostSet = new Set<string>()
  if (active && ghostY !== null && ghostY !== active.y) {
    getPieceCells(active, ghostY).forEach(({ x, y }) => {
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !board[y][x]) {
        ghostSet.add(`${x},${y}`)
      }
    })
  }

  const activeSet = new Set<string>()
  if (active) {
    getPieceCells(active).forEach(({ x, y }) => {
      activeSet.add(`${x},${y}`)
    })
  }

  return (
    <div className="board" role="grid" aria-label="Tetris board">
      {display.map((row, y) =>
        row.map((cell, x) => {
          const key = `${x},${y}`
          const isActive = activeSet.has(key)
          const isGhost = ghostSet.has(key) && !isActive

          if (isActive) {
            return <CellBlock key={key} type={cell as PieceType} variant="filled" />
          }
          if (isGhost) {
            return <CellBlock key={key} type={cell as PieceType} variant="ghost" />
          }
          return <CellBlock key={key} type={cell} />
        }),
      )}
    </div>
  )
}
