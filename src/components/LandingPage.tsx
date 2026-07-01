import { DIFFICULTY_CONFIG } from '../constants'
import type { Difficulty } from '../types'

type LandingPageProps = {
  displayName: string
  highScore: number
  difficulty: Difficulty
  soundEnabled: boolean
  onStartGame: () => void
  onShowHighScore: () => void
  onShowLeaderboard: () => void
  onShowSettings: () => void
  onLogout: () => void
}

export function LandingPage({
  displayName,
  highScore,
  difficulty,
  soundEnabled,
  onStartGame,
  onShowHighScore,
  onShowLeaderboard,
  onShowSettings,
  onLogout,
}: LandingPageProps) {
  return (
    <div className="landing">
      <div className="landing-card">
        <h1 className="landing-title">TETRIS</h1>
        <p className="landing-subtitle">Hello, {displayName}</p>

        <div className="landing-preview">
          <div className="landing-block i" />
          <div className="landing-block o" />
          <div className="landing-block t" />
          <div className="landing-block s" />
        </div>

        <div className="landing-actions">
          <button type="button" className="btn btn-primary" onClick={onStartGame}>
            Start New Game
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowHighScore}>
            High Score
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowLeaderboard}>
            Today&apos;s Leaderboard
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowSettings}>
            Settings
          </button>
          <button type="button" className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="landing-meta">
          <span>Best: {highScore}</span>
          <span>Level: {DIFFICULTY_CONFIG[difficulty].label}</span>
          <span>Sound: {soundEnabled ? 'On' : 'Off'}</span>
        </div>
      </div>
    </div>
  )
}
