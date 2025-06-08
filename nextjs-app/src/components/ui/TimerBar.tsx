import './TimerBar.css'

export interface TimerBarProps {
  timeLeft: number
  TOTAL_TIME: number
}

export default function TimerBar({ timeLeft, TOTAL_TIME }: TimerBarProps) {
  const percent = (timeLeft / TOTAL_TIME) * 100
  const danger = timeLeft <= 5
  return (
    <div className="timer-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_TIME} aria-valuenow={timeLeft}>
      <div
        className="timer-bar-fill"
        style={{ width: `${percent}%`, backgroundColor: danger ? 'var(--color-deep-red)' : 'var(--color-brand)' }}
      />
    </div>
  )
}
