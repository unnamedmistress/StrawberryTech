import { ADVENTURE_GAMES } from '../../utils/adventure'
import './AdventureProgress.css'

export default function AdventureProgress({ step }: { step: number }) {
  return (
    <ol className="adventure-progress">
      {ADVENTURE_GAMES.map((g, idx) => (
        <li
          key={g.key}
          className={`${idx < step ? 'done' : ''} ${idx === step ? 'current' : ''}`}
        >
          <span className="step-num">{idx + 1}</span>
          <span className="step-label">{g.title}</span>
        </li>
      ))}
    </ol>
  )
}
