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
  /** Example model response for the good prompt */
  response: string
}


export const ROUNDS: DartRound[] = [
  {
    bad: 'Tell me about AI.',
    good: 'List 3 use cases of AI in customer service.',
    why: 'The good prompt is specific about the desired output.',
    response: '1. Answer common questions\n2. Route tickets\n3. Provide 24/7 help'
  },
  {
    bad: 'Write an email.',
    good: 'Draft a 3-sentence email to a hiring manager explaining your interest.',
    why: 'It clearly states the format and audience.',
    response: 'Dear Hiring Manager, ... (three sentences)'
  },
  {
    bad: 'Explain climate change.',
    good: 'Summarize 2 key causes of climate change in one paragraph.',
    why: 'A concise request focuses the response.',
    response: 'The main causes are greenhouse gases and deforestation.'
  },
  {
    bad: 'Summarize this article.',
    good: 'Provide a two-sentence summary highlighting the main argument.',
    why: 'Defining length keeps the summary tight.',
    response: 'Sentence one. Sentence two.'
  },
  {
    bad: 'Translate this text.',
    good: 'Translate the following text from English to Spanish.',
    why: 'Specifying languages makes the task clear.',
    response: 'Texto traducido al español.'
  },
  {
    bad: 'Analyze our sales.',
    good: "List 3 key insights from last quarter's sales data in bullet form.",
    why: 'The format and focus are spelled out.',
    response: '- Insight one\n- Insight two\n- Insight three'
  },
  {
    bad: 'Write marketing copy.',
    good: 'Compose a short tweet promoting our new product and mention its top benefit.',
    why: 'Including format and detail improves clarity.',
    response: 'Check out our new product! It saves you time ⏱️ #NewRelease'
  },
  {
    bad: 'Weather?',
    good: "Give today's weather forecast for Tokyo in Celsius.",
    why: 'Location and units guide the response.',
    response: 'Today in Tokyo it will be 22°C with light rain.'
  },
  {
    bad: 'Code a function.',
    good: 'Write a Python function that reverses a string.',
    why: 'The good prompt specifies language and purpose.',
    response: 'def reverse_string(s):\n    return s[::-1]'
  },
  {
    bad: 'Story please.',
    good: 'Write a short bedtime story about a dragon who learns to code.',
    why: 'Topic and tone are defined.',
    response: 'Once upon a time, a curious dragon learned Python...'
  },
  {
    bad: 'Advice on focus.',
    good: 'Provide three tips for staying productive while working remotely.',
    why: 'Numbered tips make expectations clear.',
    response: '1. Keep a routine\n2. Set boundaries\n3. Take breaks'
  },
  {
    bad: 'Help with calculus.',
    good: 'Explain in two sentences how to find the derivative of x^2.',
    why: 'The good prompt constrains the explanation.',
    response: 'Use the power rule: bring down the exponent and subtract one.'
  },
  {
    bad: 'Improve sentence.',
    good: 'Rewrite the following sentence to sound more professional.',
    why: 'The instruction is clearer about the goal.',
    response: 'Original: ... Revised: ...'
  },
  {
    bad: 'List activities.',
    good: 'Provide five kid-friendly indoor activities for a rainy day.',
    why: 'Quantity and audience are defined.',
    response: '1. Build a blanket fort...'
  },
  {
    bad: 'History facts.',
    good: 'Give a brief overview of the causes of the French Revolution.',
    why: 'The good prompt specifies the scope.',
    response: 'High taxes and social inequality led to unrest...'
  },
  {
    bad: 'Get user data.',
    good: 'Create an SQL query to find the ten most recent orders.',
    why: 'The request defines exactly what results are needed.',
    response: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;'
  },
  {
    bad: 'Recipe ideas.',
    good: 'Share a simple recipe for vegan chocolate chip cookies.',
    why: 'Specifying ingredients helps produce a useful recipe.',
    response: 'Mix flour, sugar, vegan butter and chocolate chips...'
  },
  {
    bad: 'Explain quantum.',
    good: 'Explain quantum entanglement in simple terms for beginners.',
    why: 'The audience is clearly defined.',
    response: 'Entanglement means two particles share a linked state even when far apart.'
  },
  {
    bad: 'Fix my laptop.',
    good: "List three common solutions for a laptop that won't turn on.",
    why: 'Stating number and issue guides troubleshooting.',
    response: '1. Check the power cable\n2. Remove the battery\n3. Try a hard reset'
  },
  {
    bad: 'Make an outline.',
    good: 'Create a 5-point outline for a blog post about time management tips.',
    why: 'The structure and topic are spelled out.',
    response: 'I. Introduction ... V. Conclusion'
  }
]


export function checkChoice(_round: DartRound, choice: 'bad' | 'good') {
  return choice === 'good'
}

export default function PromptDartsGame() {
  const { setScore, user } = useContext(UserContext)
  const [rounds] = useState<DartRound[]>(() => shuffle(ROUNDS))
  const [round, setRound] = useState(0)
  const [choice, setChoice] = useState<'bad' | 'good' | null>(null)
  const [order, setOrder] = useState<Array<'bad' | 'good'>>(() =>
    Math.random() < 0.5 ? ['bad', 'good'] : ['good', 'bad']
  )
  const [score, setScoreState] = useState(0)

  const TOTAL_TIME =
    user.difficulty === 'easy' ? 20 : user.difficulty === 'hard' ? 10 : 15
  const MAX_POINTS =
    user.difficulty === 'easy' ? 8 : user.difficulty === 'hard' ? 12 : 10
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [pointsLeft, setPointsLeft] = useState(MAX_POINTS)
  const current = ROUNDS[round]


  useEffect(() => {
    setTimeLeft(TOTAL_TIME)
    setPointsLeft(MAX_POINTS)

  }, [round, TOTAL_TIME, MAX_POINTS])


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
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
            alt="Strawberry throwing dart hitting 'Clear Prompt' bullseye on prompt darts target."
            className="hero-img"
            style={{ width: '200px' }}
          />

          <h3>Round {round + 1} of {ROUNDS.length}</h3>

          <p className="timer">Time: {timeLeft}s</p>
          <p className="points">Available points: {pointsLeft}</p>

          <p>Which prompt is clearer?</p>
          <div className="options">
            {order.map(opt => (
              <button
                key={opt}
                className="btn-primary"
                onClick={() => handleSelect(opt)}
                disabled={choice !== null}
              >
                {current[opt]}
              </button>
            ))}
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
            <p className="feedback">Time's up! No points this round.</p>
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
