import { useContext, useEffect, useRef, useState } from 'react'
import { useLeaderboards, type PointsEntry } from '../../shared/useLeaderboards'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import { getTotalPoints } from '../../utils/user'
import Tooltip from '../ui/Tooltip'
import { GOAL_POINTS } from '../../constants/progress'

export interface ProgressSidebarProps {
  points?: Record<string, number>
  badges?: string[]
}

export default function ProgressSidebar({ points, badges }: ProgressSidebarProps = {}) {
  const { user } = useContext(UserContext) as UserContextType

  const userPoints = points ?? user.points
  const [progress, setProgress] = useState({
    totalPoints: getTotalPoints(userPoints),
    badges: badges ?? user.badges,
  })
  const userBadges = progress.badges
  const totalPoints = progress.totalPoints
  const celebrated = useRef(false)

  const { data } = useLeaderboards()
  const leaderboards = data ?? {}

  useEffect(() => {
    if (totalPoints >= GOAL_POINTS && !celebrated.current) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      celebrated.current = true
    }
  }, [totalPoints])




  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const slug = path.split('/')[2]
  const gameMap: Record<string, string> = {
    darts: 'darts',
    intro: 'intro',
    recipe: 'recipe',
    escape: 'escape',
    guess: 'escape',
    chain: 'chain',
    quiz: 'quiz',
    tone: 'tone',
  }
  const game = gameMap[slug] || 'darts'

  const entries = (leaderboards[game] ?? [])
    .concat({ id: user.id, name: user.name ?? 'You', points: userPoints[game] ?? 0 })
    .sort((a: PointsEntry, b: PointsEntry) => b.points - a.points)

  const rank = entries.findIndex((e: PointsEntry) => e.id === user.id) + 1
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
          {leaderboard.map((entry: PointsEntry, idx: number) => (
            <li key={entry.name} className={idx === 0 ? 'top' : undefined}>
              {idx === 0 && <span aria-hidden="true">🏆 </span>}
              {entry.name}: {entry.points}
            </li>
          ))}
        </ol>
        <p className="your-rank" aria-live="polite" aria-atomic="true">
          Your rank: #{rank}
        </p>      </div>
      <p className="view-leaderboard">
        <Link href="/community">View community & leaderboard</Link>
      </p>
    </aside>
  )
}
