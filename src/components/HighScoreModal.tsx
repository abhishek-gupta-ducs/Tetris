type HighScoreModalProps = {
  highScore: number
  onClose: () => void
}

export function HighScoreModal({ highScore, onClose }: HighScoreModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal high-score-modal"
        role="dialog"
        aria-labelledby="high-score-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="high-score-title">High Score</h2>
        <p className="modal-score">{highScore}</p>
        <p className="modal-hint">Your best score is saved on this device.</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
