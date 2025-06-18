import { useState } from 'react'
import styles from './EmailIntroModal.module.css'

export default function EmailIntroModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'welcome' | 'details' | 'howto'>('welcome')

  return (
    <div className={styles['intro-overlay']} role="dialog" aria-modal="true">
      <div className={styles['intro-modal']}>
        {step === 'welcome' && (
          <>
            <h2>Welcome to AI Basics!</h2>
            <p>
              AI is like a smart helper that guesses the next words in a
              sentence.
            </p>
            <button className="btn-primary" onClick={() => setStep('details')}>
              Next
            </button>
          </>
        )}
        {step === 'details' && (
          <>
            <p>
              Behind the scenes, large language models read millions of example
              sentences. They learn patterns so they can predict the most likely
              next word when given a prompt.
            </p>
            <p>
              In this short game you'll build an email one line at a time to see
              how those predictions add up.
            </p>
            <button className="btn-primary" onClick={() => setStep('howto')}>
              How do I play?
            </button>
          </>
        )}
        {step === 'howto' && (
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
