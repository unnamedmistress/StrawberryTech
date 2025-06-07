import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import { UserContext } from '../context/UserContext'
import './PromptDartsGame.css'

export interface DartRound {
  bad: string
  good: string
}

export const ROUNDS: DartRound[] = [
  { bad: 'Tell me about AI.', good: 'List 3 use cases of AI in customer service.' },
  {
    bad: 'Write an email.',
    good: 'Draft a 3-sentence email to a hiring manager explaining your interest.',
  },
  {
    bad: 'Explain climate change.',
    good: 'Summarize 2 key causes of climate change in one paragraph.',
  },
]

export function checkChoice(_round: DartRound, choice: 'bad' | 'good') {
  return choice === 'good'
}

export default function PromptDartsGame() {
  const { setScore } = useContext(UserContext)
  const [round, setRound] = useState(0)
  const [choice, setChoice] = useState<'bad' | 'good' | null>(null)
  const [score, setScoreState] = useState(0)
  const TOTAL_TIME = 15
  const MAX_POINTS = 10
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [pointsLeft, setPointsLeft] = useState(MAX_POINTS)
  const current = ROUNDS[round]

  useEffect(() => {
    setTimeLeft(TOTAL_TIME)
    setPointsLeft(MAX_POINTS)
  }, [round])

  useEffect(() => {
    if (choice !== null || timeLeft <= 0) return
    const id = setTimeout(() => {
      setTimeLeft(t => t - 1)
      setPointsLeft(p => Math.max(0, p - 1))
    }, 1000)
    return () => clearTimeout(id)
  }, [timeLeft, choice])

  function handleSelect(option: 'bad' | 'good') {
    setChoice(option)
    if (checkChoice(current, option)) {
      setScoreState(s => s + pointsLeft)
    }
  }

  function next() {
    if (round + 1 < ROUNDS.length) {
      setRound(r => r + 1)
      setChoice(null)
      setTimeLeft(TOTAL_TIME)
      setPointsLeft(MAX_POINTS)
    } else {
      setScore('darts', score)
      setRound(r => r + 1)
    }
  }

  if (round >= ROUNDS.length) {
    return (
      <div className="darts-page">
        <InstructionBanner>You finished Prompt Darts!</InstructionBanner>
        <p className="final-score">Your score: {score}</p>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/leaderboard">Return to Progress</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="darts-page">
      <InstructionBanner>
        Choose the clearer prompt that best targets the requested format.
      </InstructionBanner>
      <div className="darts-wrapper">
        <aside className="darts-sidebar">
          <h3>Why Clarity Matters</h3>
          <p>The clearer your target, the better your aim. Clear prompts act like aiming sights for AI.</p>
          <blockquote className="sidebar-quote">Why Card: Why Clarity Matters</blockquote>
          <p className="sidebar-tip">Align prompt language with output types (teaching specificity and clarity).</p>
        </aside>
        <div className="darts-game">
          <h3>Round {round + 1} of {ROUNDS.length}</h3>
          <p className="timer">Time: {timeLeft}s</p>
          <p className="points">Available points: {pointsLeft}</p>
          <p>Which prompt is clearer?</p>
          <div className="options">
            <button className="btn-primary" onClick={() => handleSelect('bad')} disabled={choice !== null}>{current.bad}</button>
            <button className="btn-primary" onClick={() => handleSelect('good')} disabled={choice !== null}>{current.good}</button>
          </div>
          {choice !== null && (
            <p className="feedback">
              {checkChoice(current, choice)
                ? 'Correct! Clear prompts hit the bullseye.'
                : 'Not quite. Aim for specific wording.'}
            </p>
          )}
          {timeLeft === 0 && choice === null && (
            <p className="feedback">Time’s up! No points this round.</p>
          )}
        </div>
        <ProgressSidebar />
        <div className="next-area">
          {choice !== null && (
            <button className="btn-primary" onClick={next}>{round + 1 < ROUNDS.length ? 'Next Round' : 'Finish'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
