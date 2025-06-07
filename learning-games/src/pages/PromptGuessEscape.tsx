import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructionBanner from '../components/ui/InstructionBanner'
import Tooltip from '../components/ui/Tooltip'
import './PromptGuessEscape.css'

interface Clue {
  aiResponse: string
  expectedPrompt: string
  hint: string
}

const CLUES: Clue[] = [
  {
    aiResponse: "Sure! Here’s a quick recipe for chicken stir-fry with vegetables.",
    expectedPrompt: "Give me a quick recipe for chicken stir-fry with vegetables.",
    hint: "Think about how you’d ask for a recipe with chicken and vegetables."
  },
  {
    aiResponse: "Buenos días means good morning in Spanish.",
    expectedPrompt: "How do you say good morning in Spanish?",
    hint: "You're basically asking for a short translation."
  },
  {
    aiResponse: "Knowledge is power' could be restated as 'Having information gives you strength and influence.'",
    expectedPrompt: "Paraphrase the quote 'Knowledge is power'.",
    hint: "Consider requesting a rewording of that famous quote."
  }
]

export default function PromptGuessEscape() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'success' | 'error' | ''>('')
  const [showHint, setShowHint] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const clue = CLUES[index]

  useEffect(() => {
    setTimeLeft(30)
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setMessage("Time's up! The door remains closed.")
          setStatus('error')
          setShowNext(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [index])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim() === clue.expectedPrompt) {
      setMessage('Correct! You unlocked the door. +10 points earned.')
      setStatus('success')
      setPoints(p => p + 10)
      setShowNext(true)
    } else {
      setMessage('Not quite right. Try again or use a hint.')
      setStatus('error')
    }
  }

  function nextChallenge() {
    if (index + 1 < CLUES.length) {
      setIndex(i => i + 1)
      setInput('')
      setMessage('')
      setStatus('')
      setShowHint(false)
      setShowNext(false)
    } else {
      navigate('/prompt-builder')
    }
  }

  return (
    <div className="guess-page">
      <InstructionBanner>Escape Room: Guess the Prompt</InstructionBanner>
      <div className="guess-wrapper">
        <aside className="guess-sidebar">
          <h3>Progress</h3>
          <p className="total-points">Total Points: {points}</p>
          <p>Badges Earned: {Math.floor(points / 300)}</p>
          <p className="goal">Reach 300 points to unlock a new badge!</p>
        </aside>
        <div className="guess-game">
          <p className="ai-response"><strong>AI Response:</strong> "{clue.aiResponse}"</p>
          <p className="instructions">Your task: Type the exact prompt that would produce the above AI response.</p>
          <p className="timer">Time left: {timeLeft}s</p>
          <form onSubmit={handleSubmit} className="prompt-form">
            <label htmlFor="prompt-input">Your Prompt</label>
            <input
              id="prompt-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type the prompt that caused this reply"
            />
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" className="btn-primary" onClick={() => setShowHint(h => !h)}>
              Hint
            </button>
          </form>
          {showHint && (
            <Tooltip message={clue.hint}>
              <span className="hint-text">{clue.hint}</span>
            </Tooltip>
          )}
          {message && (
            <p className={`feedback ${status}`}>{status === 'success' ? '✔️' : '⚠️'} {message}</p>
          )}
          {showNext && (
            <div className="next-area">
              <button className="btn-primary" onClick={nextChallenge}>Next Challenge</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
