import { useContext, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Tooltip from '../ui/Tooltip'
import { getTotalPoints } from '../../utils/user'
import type { ScoreEntry } from '../../pages/LeaderboardPage'
import { GOAL_POINTS } from '../../constants/progress'

export interface ProgressSidebarProps {
  scores?: Record<string, number>
  badges?: string[]
}

export default function ProgressSidebar({ scores, badges }: ProgressSidebarProps = {}) {
  const { user } = useContext(UserContext)

  const userScores = scores ?? user.scores
  const userBadges = badges ?? user.badges

  const totalPoints = getTotalPoints(userScores)
  const celebrated = useRef(false)
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([])

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
        .then((data: Record<string, ScoreEntry[]>) => {
          setScoreEntries(Array.isArray(data.darts) ? data.darts : [])
        })
        .catch(() => {})
    }
  }, [])

  const leaderboard = scoreEntries
    .concat({ name: user.name ?? 'You', score: userScores['darts'] ?? 0 })
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
      <p aria-live="polite" aria-atomic="true">Badges Earned: {userBadges.length}</p>
      <div className="badge-icons">
        {userBadges.map((b) => (
          <Tooltip key={b} message={b}>
            <span role="img" aria-label={b}>🏅</span>
          </Tooltip>
        ))}
        {userBadges.length === 0 && <span>No badges yet.</span>}
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
