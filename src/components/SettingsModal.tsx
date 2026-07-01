import { DIFFICULTY_CONFIG } from '../constants'
import type { Difficulty } from '../types'

type SettingsModalProps = {
  difficulty: Difficulty
  soundEnabled: boolean
  onDifficultyChange: (difficulty: Difficulty) => void
  onSoundChange: (enabled: boolean) => void
  onClose: () => void
}

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'intermediate', 'hard']

export function SettingsModal({
  difficulty,
  soundEnabled,
  onDifficultyChange,
  onSoundChange,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal settings-modal"
        role="dialog"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title">Settings</h2>

        <div className="settings-group">
          <h3>Difficulty</h3>
          <div className="difficulty-options">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                onClick={() => onDifficultyChange(level)}
              >
                {DIFFICULTY_CONFIG[level].label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h3>Sound</h3>
          <label className="toggle-row">
            <span>Music &amp; effects</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onSoundChange(e.target.checked)}
            />
          </label>
        </div>

        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
