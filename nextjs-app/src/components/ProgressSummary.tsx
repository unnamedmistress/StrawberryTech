import React, { useEffect, useState } from 'react'
import { getApiBase } from '../utils/api'

interface ProgressSummaryProps {
  totalPoints?: number
  badges?: string[]
  goalPoints: number
}

export default function ProgressSummary({ totalPoints, badges, goalPoints }: ProgressSummaryProps) {
  const [progress, setProgress] = useState({ totalPoints: totalPoints ?? 0, badges: badges ?? [] as string[] })

  useEffect(() => {
    if (totalPoints !== undefined && badges !== undefined) return
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/progress`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data) setProgress(data)
        })
        .catch(() => {})
    }
  }, [totalPoints, badges])

  const pts = totalPoints ?? progress.totalPoints
  const earned = badges ?? progress.badges

  return (
    <div className="progress-summary">
      <p>Total Points: {pts}</p>
      <progress value={pts} max={goalPoints} />
      <p>Badges Earned: {earned.length}</p>
      <div className="badge-icons">
        {earned.map((b) => (
          <span key={b}>🏅</span>
        ))}
      </div>
    </div>
  )
}
