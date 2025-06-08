import { useState, useEffect, useRef } from 'react'
import InstructionBanner from '../components/ui/InstructionBanner'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import './ComposeTweetGame.css'

const SAMPLE_RESPONSE =
  'Just finished reading an amazing book on technology! Highly recommend it to everyone. #BookLovers'
const CORRECT_PROMPT = 'Compose a tweet about reading a new book'

export default function ComposeTweetGame() {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [doorUnlocked, setDoorUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setFeedback('Too slow! The door remains locked.')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (guess.trim().toLowerCase() === CORRECT_PROMPT.toLowerCase()) {
      setFeedback('Correct! The door is unlocked.')
      setDoorUnlocked(true)
      clearInterval(timerRef.current!)
    } else {
      setFeedback('Incorrect guess, try again.')
    }
    setGuess('')
  }

  function handleHint() {
    setFeedback(`Hint: The prompt is about ${CORRECT_PROMPT.split(' ')[2]}...`)
  }

  return (
    <div className="compose-page clearfix">
      <InstructionBanner>Guess the Prompt</InstructionBanner>
      <div className="compose-wrapper">
        <aside className="compose-sidebar">
          <p className="timer">Time left: {timeLeft}s</p>
        </aside>
        <div className="compose-game">
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
            alt="Strawberry calling out sick wrapped in blanket, holding phone with polite sick day message bubble."
            className="game-card-image"
          />
          <div className="ai-box" aria-live="polite">
            {SAMPLE_RESPONSE}
          </div>
          <form onSubmit={handleSubmit} className="prompt-form">
            <label htmlFor="prompt-input">Your guess</label>
            <input
              id="prompt-input"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Guess the prompt..."
              aria-label="Input your guess for the prompt"
            />
            <button type="submit" className="btn-primary" aria-label="Submit your guess">
              Submit
            </button>
            <button
              type="button"
              onClick={handleHint}
              className="btn-primary"
              aria-label="Get a hint"
            >
              Hint
            </button>
          </form>
          {feedback && <p className="feedback">{feedback}</p>}
          <div className="door-area">
            <img
              src={doorUnlocked ? '/images/door-open.png' : '/images/door-closed.png'}
              alt={doorUnlocked ? 'Door unlocked' : 'Door locked'}
              width={100}
              height={150}
            />
            {doorUnlocked && (
              <img
                src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png"
                alt="Another version of strawberry calling out sick, same description."
                className="hero-img"
                style={{ width: '200px' }}
              />
            )}
          </div>
        </div>
        <ProgressSidebar />
      </div>
    </div>
  )
}
