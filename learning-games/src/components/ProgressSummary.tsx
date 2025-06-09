interface ProgressSummaryProps {
  totalPoints: number
  badges: string[]
  goalPoints: number
}

export default function ProgressSummary({ totalPoints, badges, goalPoints }: ProgressSummaryProps) {
  return (
    <div className="progress-summary">
      <p>Total Points: {totalPoints}</p>
      <progress value={totalPoints} max={goalPoints} />
      <p>Badges Earned: {badges.length}</p>
      <div className="badge-icons">
        {badges.map((b) => (
          <span key={b}>🏅</span>
        ))}
      </div>
    </div>
  )
}
