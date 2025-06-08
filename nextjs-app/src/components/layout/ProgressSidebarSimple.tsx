import React from 'react'
import './ProgressSidebarSimple.css'

export interface ScoreEntry {
  name: string
  points: number
}

interface ProgressSidebarSimpleProps {
  totalPoints: number
  badgesEarned: number
  goalPoints: number
  topScores: ScoreEntry[]
}

const ProgressSidebarSimple: React.FC<ProgressSidebarSimpleProps> = ({
  totalPoints,
  badgesEarned,
  goalPoints,
  topScores,
}) => {
  const progressPercent = Math.min((totalPoints / goalPoints) * 100, 100)

  return (
    <aside className="progress-sidebar-simple" aria-label="Player progress">
      <h2>Your Progress</h2>
      <p>Total Points: {totalPoints}</p>
      <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goalPoints} aria-valuenow={totalPoints}>
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="goal-text">Goal: Reach {goalPoints} points to unlock a new badge!</p>
      <p>Badges Earned: {badgesEarned}</p>
      <h3>Top Scores</h3>
      <ul className="top-scores-list">
        {topScores.length === 0 ? (
          <li>No scores yet.</li>
        ) : (
          topScores.map(({ name, points }) => (
            <li key={name}>
              {name}: {points}
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}

export default ProgressSidebarSimple
