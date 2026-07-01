import { PIECE_COLORS } from '../constants'
import type { PieceType } from '../types'
import { PREVIEW_GRID_SIZE, getPreviewGrid } from '../utils/tetrominos'

type PiecePreviewProps = {
  label: string
  piece: PieceType | null
}

export function PiecePreview({ label, piece }: PiecePreviewProps) {
  const grid = piece
    ? getPreviewGrid(piece)
    : Array.from({ length: PREVIEW_GRID_SIZE }, () =>
        Array(PREVIEW_GRID_SIZE).fill(null),
      )

  return (
    <div className="piece-preview">
      <h3 className="preview-label">{label}</h3>
      <div className="preview-grid">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`preview-cell ${cell ? 'filled' : ''}`}
              style={cell ? { backgroundColor: PIECE_COLORS[cell] } : undefined}
            />
          )),
        )}
      </div>
    </div>
  )
}
