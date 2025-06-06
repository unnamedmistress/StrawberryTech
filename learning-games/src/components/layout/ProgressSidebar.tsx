import { useContext, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { DUMMY_SCORES } from '../../pages/LeaderboardPage'

export default function ProgressSidebar() {
  const { user } = useContext(UserContext)
  const totalPoints = Object.values(user.scores).reduce((a, b) => a + b, 0)
  const GOAL_POINTS = 100
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
      <p aria-live="polite" aria-atomic="true">Badges Earned: {user.badges.length}</p>
      <div className="badge-icons">
        {user.badges.map((b) => (
          <span key={b} title={b}>🏅</span>
        ))}
        {user.badges.length === 0 && <span>No badges yet.</span>}
      </div>
      <h4 className="top-scores-title">Top Scores</h4>
      <ol className="top-scores-list">
        {leaderboard.map((entry, idx) => (
          <li key={entry.name} className={idx === 0 ? 'top' : undefined}>
            {entry.name}: {entry.score}
          </li>
        ))}
      </ol>
      <p className="view-leaderboard">
        <Link to="/leaderboard">View full leaderboard</Link>
      </p>
    </aside>
  )
}
