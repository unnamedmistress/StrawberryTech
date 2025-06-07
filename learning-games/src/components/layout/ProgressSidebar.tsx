import { useContext, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { DUMMY_SCORES } from '../../pages/LeaderboardPage'
import Tooltip from '../ui/Tooltip'

export default function ProgressSidebar() {
  const { user } = useContext(UserContext)
  const totalPoints = Object.values(user.scores).reduce((a, b) => a + b, 0)
  const GOAL_POINTS = 300
  const celebrated = useRef(false)

  useEffect(() => {
    if (totalPoints >= GOAL_POINTS && !celebrated.current) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      celebrated.current = true
    }
  }, [totalPoints])
  const leaderboard = DUMMY_SCORES.tone
    .concat({ name: user.name ?? 'You', score: user.scores['tone'] ?? 0 })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <aside className="progress-sidebar">
      <h3>Your Progress</h3>
      <p aria-live="polite" aria-atomic="true">Total Points: {totalPoints}</p>
      <progress value={totalPoints} max={GOAL_POINTS} />
      <p className="goal-message" aria-live="polite" aria-atomic="true">
        Goal: Reach {GOAL_POINTS} points to unlock a new badge!
      </p>
      <p aria-live="polite" aria-atomic="true">Badges Earned: {user.badges.length}</p>
      <div className="badge-icons">
        {user.badges.map((b) => (
          <Tooltip key={b} message={b}>
            <span role="img" aria-label={b}>🏅</span>
          </Tooltip>
        ))}
        {user.badges.length === 0 && <span>No badges yet.</span>}
      </div>
      <h4 className="top-scores-title">Top Scores</h4>
      <div className="top-scores-card">
        <ol className="top-scores-list">
          {leaderboard.map((entry, idx) => (
            <li key={entry.name} className={idx === 0 ? 'top' : undefined}>
              {idx === 0 && <span aria-hidden="true">🏆 </span>}
              {entry.name}: {entry.score}
            </li>
          ))}
        </ol>
      </div>
      <p className="view-leaderboard">
        <Link to="/leaderboard">View full leaderboard</Link>
      </p>
    </aside>
  )
}
