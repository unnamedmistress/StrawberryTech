import { useContext, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Link, useLocation } from 'react-router-dom'
import { UserContext } from '../../../../shared/UserContext'
import Tooltip from '../ui/Tooltip'
import { getTotalPoints } from '../../utils/user'
import { GOAL_POINTS } from '../../constants/progress'
import { useLeaderboards, type PointsEntry } from '../../../../shared/useLeaderboards'

export interface ProgressSidebarProps {
  points?: Record<string, number>
  badges?: string[]
}

export default function ProgressSidebar({ badges }: ProgressSidebarProps = {}) {
  const { user } = useContext(UserContext)

  const userScores = user.points
  const userBadges = badges ?? user.badges




  const totalPoints = getTotalPoints(userScores)

  const celebrated = useRef(false)
  const { data: leaderboards = {} } = useLeaderboards()

  useEffect(() => {
    if (totalPoints >= GOAL_POINTS && !celebrated.current) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      celebrated.current = true
    }
  }, [totalPoints])



  const location = useLocation()
  const slug = location.pathname.split('/')[2]
  const gameMap: Record<string, string> = {
    darts: 'darts',
    recipe: 'recipe',
    escape: 'escape',
    guess: 'escape',
    compose: 'compose',
    quiz: 'quiz',
    tone: 'tone',
  }
  const game = gameMap[slug] || 'darts'

  const entries = (leaderboards[game] ?? [])
    .concat({ name: user.name ?? 'You', points: userScores[game] ?? 0 })
    .sort((a, b) => b.points - a.points)

  const rank = entries.findIndex(e => e.name === (user.name ?? 'You')) + 1
  const leaderboard = entries.slice(0, 3)

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
        <p className="your-rank" aria-live="polite" aria-atomic="true">
          Your rank: #{rank}
        </p>
      </div>
      <p className="view-leaderboard">
        <Link to="/leaderboard">View full leaderboard</Link>
      </p>
    </aside>
  )
}
