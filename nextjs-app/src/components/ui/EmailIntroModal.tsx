import { useState } from 'react'
import styles from './EmailIntroModal.module.css'

export default function EmailIntroModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'welcome' | 'howto'>('welcome')

  return (
    <div className={styles['intro-overlay']} role="dialog" aria-modal="true">
      <div className={styles['intro-modal']}>
        {step === 'welcome' ? (
          <>
            <h2>Welcome to AI Basics!</h2>
            <p>
              AI is like a smart helper that guesses the next words in a
              sentence.
            </p>
            <button className="btn-primary" onClick={() => setStep('howto')}>
              Next
            </button>
          </>
        ) : (
          <>
            <h2>How to Play</h2>
            <ul>
              <li>Pick the type of email you need.</li>
              <li>Choose three lines suggested by AI.</li>
              <li>Watch the preview grow after each choice.</li>
            </ul>
            <button className="btn-primary" onClick={onClose}>
              Start Building
            </button>
          </>
        )}
      </div>
    </div>
  )
}
