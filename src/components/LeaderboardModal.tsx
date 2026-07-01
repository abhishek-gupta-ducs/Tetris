import { useDailyLeaderboard } from '../hooks/useDailyLeaderboard'

type LeaderboardModalProps = {
  currentUserId: string | null
  onClose: () => void
}

export function LeaderboardModal({ currentUserId, onClose }: LeaderboardModalProps) {
  const { entries, loading, error, reload, dateLabel } = useDailyLeaderboard(true)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal leaderboard-modal"
        role="dialog"
        aria-labelledby="leaderboard-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="leaderboard-title">Today&apos;s Leaderboard</h2>
        <p className="leaderboard-date">{dateLabel} · UTC</p>

        {loading && <p className="leaderboard-status">Loading scores...</p>}

        {!loading && error && (
          <div className="leaderboard-status leaderboard-error">
            <p>{error}</p>
            <button type="button" className="btn btn-secondary" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="leaderboard-status">No scores yet today. Be the first!</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <ol className="leaderboard-list">
            {entries.map((entry) => (
              <li
                key={entry.uid}
                className={`leaderboard-row${
                  entry.uid === currentUserId ? ' is-current-user' : ''
                }`}
              >
                <span className="leaderboard-rank">#{entry.rank}</span>
                <span className="leaderboard-name">{entry.displayName}</span>
                <span className="leaderboard-score">{entry.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}

        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
