import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import { UserContext } from '../context/UserContext'
import shuffle from '../utils/shuffle'
import './PromptDartsGame.css'

export interface DartRound {
  bad: string
  good: string

  why: string
}

export const ROUNDS: DartRound[] = [
  { bad: 'Tell me about AI.', good: 'List 3 use cases of AI in customer service.' },
  { bad: 'Write an email.', good: 'Draft a 3-sentence email to a hiring manager explaining your interest.' },
  { bad: 'Explain climate change.', good: 'Summarize 2 key causes of climate change in one paragraph.' },
  { bad: 'Summarize this article.', good: 'Provide a two-sentence summary highlighting the main argument.' },
  { bad: 'Translate this text.', good: 'Translate the following text from English to Spanish.' },
  { bad: 'Analyze our sales.', good: 'List 3 key insights from last quarter\'s sales data in bullet form.' },
  { bad: 'Write marketing copy.', good: 'Compose a short tweet promoting our new product and mention its top benefit.' },
  { bad: 'Weather?', good: 'Give today\'s weather forecast for Tokyo in Celsius.' },
  { bad: 'Code a function.', good: 'Write a Python function that reverses a string.' },
  { bad: 'Story please.', good: 'Write a short bedtime story about a dragon who learns to code.' },
  { bad: 'Advice on focus.', good: 'Provide three tips for staying productive while working remotely.' },
  { bad: 'Help with calculus.', good: 'Explain in two sentences how to find the derivative of x^2.' },
  { bad: 'Improve sentence.', good: 'Rewrite the following sentence to sound more professional.' },
  { bad: 'List activities.', good: 'Provide five kid-friendly indoor activities for a rainy day.' },
  { bad: 'History facts.', good: 'Give a brief overview of the causes of the French Revolution.' },
  { bad: 'Get user data.', good: 'Create an SQL query to find the ten most recent orders.' },
  { bad: 'Recipe ideas.', good: 'Share a simple recipe for vegan chocolate chip cookies.' },
  { bad: 'Explain quantum.', good: 'Explain quantum entanglement in simple terms for beginners.' },
  { bad: 'Fix my laptop.', good: 'List three common solutions for a laptop that won\'t turn on.' },
  { bad: 'Make an outline.', good: 'Create a 5-point outline for a blog post about time management tips.' },
 ]



export function checkChoice(_round: DartRound, choice: 'bad' | 'good') {
  return choice === 'good'
}

export default function PromptDartsGame() {
  const { setScore } = useContext(UserContext)
  const [rounds] = useState<DartRound[]>(() => shuffle(ROUNDS))
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
    if (round + 1 < rounds.length) {
      setRound(r => r + 1)
      setChoice(null)
      setTimeLeft(TOTAL_TIME)
      setPointsLeft(MAX_POINTS)
    } else {
      setScore('darts', score)
      setRound(r => r + 1)
    }
  }

  if (round >= rounds.length) {
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

            <>
              <p className="feedback">
                {checkChoice(current, choice)
                  ? 'Correct! Clear prompts hit the bullseye.'
                  : 'Not quite. Aim for specific wording.'}
              </p>

              <p className="why-message">{current.why}</p>
              <pre className="canned-response">{current.response}</pre>

            </>

          )}
          {timeLeft === 0 && choice === null && (
            <p className="feedback">Time’s up! No points this round.</p>
          )}
        </div>
        <ProgressSidebar />
        <div className="next-area">
          {choice !== null && (
            <button className="btn-primary" onClick={next}>{round + 1 < rounds.length ? 'Next Round' : 'Finish'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
