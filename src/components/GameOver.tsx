type GameOverProps = {
  score: number
  highScore: number
  visible: boolean
  onRestart: () => void
  onMainMenu: () => void
}

export function GameOver({
  score,
  highScore,
  visible,
  onRestart,
  onMainMenu,
}: GameOverProps) {
  if (!visible) return null

  const isNewHigh = score >= highScore && score > 0

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2>Game Over</h2>
        <p className="final-score">Score: {score}</p>
        {isNewHigh && <p className="new-high">New High Score!</p>}
        <div className="game-over-actions">
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            Play Again
          </button>
          <button type="button" className="btn btn-secondary" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}
