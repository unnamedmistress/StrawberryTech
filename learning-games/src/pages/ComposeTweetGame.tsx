
import { useState, useEffect, useRef, useContext } from 'react'

import { scorePrompt } from '../utils/scorePrompt'

import InstructionBanner from '../components/ui/InstructionBanner'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import CompletionModal from '../components/ui/CompletionModal'
import { UserContext } from '../context/UserContext'
import './ComposeTweetGame.css'

const SAMPLE_RESPONSE =
  'Just finished reading an amazing book on technology! Highly recommend it to everyone. #BookLovers'
const CORRECT_PROMPT = 'Compose a tweet about reading a new book'
const SCORE_THRESHOLD = 20

const PROMPT_TIPS = [
  'Be specific about what you want the AI to do.',
  'Provide context so the AI understands your request.',
  'Break complex tasks into clear steps.',
  'State the desired length or format.',
  'Offer examples to show the style you expect.',

]

interface PromptPair {
  prompt: string
  response: string
}

const pairs: PromptPair[] = [
  { prompt: CORRECT_PROMPT, response: SAMPLE_RESPONSE },
]

export default function ComposeTweetGame() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [doorUnlocked, setDoorUnlocked] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  const [round, setRound] = useState(0)
  const [showNext, setShowNext] = useState(false)

  const [score, setScoreState] = useState<number | null>(null)

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

  useEffect(() => {
    if (!doorUnlocked) return
    const id = setInterval(() => {
      setTipIndex(i => (i + 1) % PROMPT_TIPS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [doorUnlocked])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { score: guessScore, tips } = scorePrompt(CORRECT_PROMPT, guess)
    if (guessScore >= SCORE_THRESHOLD) {
      setFeedback('Correct! The door is unlocked.')
      setDoorUnlocked(true)
      const earned = guessScore + timeLeft
      setScoreState(earned)
      clearInterval(timerRef.current!)
      setScore('compose', earned)
      if (timeLeft >= 20 && !user.badges.includes('speedy-composer')) {
        addBadge('speedy-composer')
      }
      setShowNext(true)
    } else {
      setFeedback(tips.join(' '))
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
    <>
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
          {score !== null && (
            <p className="final-score" aria-live="polite">
              Your score: {score}
            </p>
          )}
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
            {doorUnlocked && (
              <p className="prompt-tip" role="status" aria-live="polite">
                {PROMPT_TIPS[tipIndex]}
              </p>
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
    {showNext && round + 1 >= pairs.length && (
      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png"
        buttonHref="/leaderboard"
        buttonLabel="View Leaderboard"
      >
        <h3>All prompts complete!</h3>
        {score !== null && (
          <p className="final-score" aria-live="polite">Your score: {score}</p>
        )}
      </CompletionModal>
    )}
  </>
  )
}
