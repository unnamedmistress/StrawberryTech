import { useContext, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Tooltip from '../ui/Tooltip'
import { getTotalPoints } from '../../utils/user'
import type { PointsEntry } from '../../pages/LeaderboardPage'
import { GOAL_POINTS } from '../../constants/progress'

export interface ProgressSidebarProps {
  points?: Record<string, number>
  badges?: string[]
}

export default function ProgressSidebar({ points, badges }: ProgressSidebarProps = {}) {
  const { user } = useContext(UserContext)



  const totalPoints = getTotalPoints(user.points)
  const GOAL_POINTS = 300

  const celebrated = useRef(false)
  const [pointsEntries, setPointsEntries] = useState<PointsEntry[]>([])

  useEffect(() => {
    if (totalPoints >= GOAL_POINTS && !celebrated.current) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      celebrated.current = true
    }
  }, [totalPoints])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/scores`)
        .then((res) => (res.ok ? res.json() : {}))
        .then((data: Record<string, PointsEntry[]>) => {
          setPointsEntries(Array.isArray(data.darts) ? data.darts : [])
        })
        .catch(() => {})
    }
  }, [])

  const leaderboard = pointsEntries
    .concat({ name: user.name ?? 'You', points: (points ?? user.points)['darts'] ?? 0 })
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)

  return (
    <aside className="progress-sidebar">
      <h3>Your Progress</h3>
      <p aria-live="polite" aria-atomic="true">Total Points: {totalPoints}</p>
      <progress value={totalPoints} max={GOAL_POINTS} />
      <p className="goal-message" aria-live="polite" aria-atomic="true">
        Goal: Reach {GOAL_POINTS} points to unlock a new badge!
      </p>
      <p aria-live="polite" aria-atomic="true">Badges Earned: {userBadges.length}</p>
      <div className="badge-icons">
        {userBadges.map((b) => (
          <Tooltip key={b} message={b}>
            <span role="img" aria-label={b}>🏅</span>
          </Tooltip>
        ))}
        {userBadges.length === 0 && <span>No badges yet.</span>}
      </div>
      <h4 className="top-points-title">Top Points</h4>
      <div className="top-points-card">
        <ol className="top-points-list">
          {leaderboard.map((entry, idx) => (
            <li key={entry.name} className={idx === 0 ? 'top' : undefined}>
              {idx === 0 && <span aria-hidden="true">🏆 </span>}
              {entry.name}: {entry.points}
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
