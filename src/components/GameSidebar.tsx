import type { PieceType } from '../types'
import { PiecePreview } from './PiecePreview'
import { StatsPanel } from './StatsPanel'

type GameSidebarProps = {
  next: PieceType
  score: number
  lines: number
  level: number
  highScore: number
  isPaused: boolean
  onEndGame: () => void
  onTogglePause: () => void
  actionsDisabled: boolean
}

export function GameSidebar({
  next,
  score,
  lines,
  level,
  highScore,
  isPaused,
  onEndGame,
  onTogglePause,
  actionsDisabled,
}: GameSidebarProps) {
  return (
    <aside className="game-sidebar">
      <div className="sidebar-section sidebar-actions">
        <button
          type="button"
          className="btn btn-game"
          onClick={onEndGame}
          disabled={actionsDisabled}
        >
          End
        </button>
        <button
          type="button"
          className="btn btn-game"
          onClick={onTogglePause}
          disabled={actionsDisabled}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="sidebar-section sidebar-preview">
        <PiecePreview label="Next" piece={next} />
      </div>

      <div className="sidebar-section sidebar-stats">
        <StatsPanel
          variant="primary"
          score={score}
          lines={lines}
          level={level}
          highScore={highScore}
        />
      </div>

      <div className="sidebar-section sidebar-stats">
        <StatsPanel
          variant="secondary"
          score={score}
          lines={lines}
          level={level}
          highScore={highScore}
        />
      </div>
    </aside>
  )
}
