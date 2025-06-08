import { useState, useEffect, useRef } from 'react'
import shuffle from '../utils/shuffle'
import InstructionBanner from '../components/ui/InstructionBanner'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import './ComposeTweetGame.css'

interface Pair {
  response: string
  prompt: string
}

const PAIRS: Pair[] = [
  {
    response:
      'Just finished reading an amazing book on technology! Highly recommend it to everyone. #BookLovers',
    prompt: 'Compose a tweet about reading a new book',
  },
  {
    response:
      "Thrilled to announce our summer sale starts June 1st! Huge discounts storewide.",
    prompt: 'Write a tweet announcing our summer sale starting June 1st',
  },
  {
    response:
      'Remember to stretch and take short breaks while studying to keep your mind sharp.',
    prompt: 'Tweet a quick study break tip',
  },
]

export default function ComposeTweetGame() {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [doorUnlocked, setDoorUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [round, setRound] = useState(0)
  const [pairs] = useState(() => shuffle(PAIRS))
  const [showNext, setShowNext] = useState(false)
  const timerRef = useRef<number | null>(null)
  const pair = pairs[round]

  useEffect(() => {
    setTimeLeft(30)
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setFeedback('Too slow! The door remains locked.')
          setShowNext(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [round])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (guess.trim().toLowerCase() === pair.prompt.toLowerCase()) {
      setFeedback('Correct! The door is unlocked.')
      setDoorUnlocked(true)
      setShowNext(true)
      clearInterval(timerRef.current!)
    } else {
      setFeedback('Incorrect guess, try again.')
    }
    setGuess('')
  }

  function handleHint() {
    const words = pair.prompt.split(' ')
    setFeedback(`Hint: The prompt is about ${words[2]}...`)
  }

  function nextRound() {
    if (round + 1 < pairs.length) {
      clearInterval(timerRef.current!)
      setRound(r => r + 1)
      setGuess('')
      setFeedback('')
      setDoorUnlocked(false)
      setShowNext(false)
    }
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
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_16_34%20PM.png"
            alt="Earlier prompt recipe builder with similar strawberry chef and cards."
            className="game-card-image"
          />
          <div className="ai-box" aria-live="polite">
            {pair.response}
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
          {showNext && round + 1 < pairs.length && (
            <button className="btn-primary" onClick={nextRound}>
              Next Prompt
            </button>
          )}
          {showNext && round + 1 >= pairs.length && (
            <p className="feedback">All prompts complete!</p>
          )}
        </div>
        <ProgressSidebar />
      </div>
    </div>
  )
}
