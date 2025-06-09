import './IntroOverlay.css'

export interface IntroOverlayProps {
  onClose: () => void
}

export default function IntroOverlay({ onClose }: IntroOverlayProps) {
  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-modal">
        <h2>How to Play</h2>
        <ul>
          <li>Objective: guess the original prompt that led to the AI response.</li>
          <li>Time limit: 30 seconds per door.</li>
          <li>Use the Hint button or press "H" for clues; each hint deducts 2 points.</li>
          <li>Earn points for clear prompts and speed — hints subtract from your score.</li>
        </ul>
        <button className="btn-primary" onClick={onClose}>Start</button>
      </div>
    </div>
  )
}
