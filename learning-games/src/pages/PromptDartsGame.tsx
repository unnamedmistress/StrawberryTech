import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CompletionModal from '../components/ui/CompletionModal'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import WhyCard from '../components/layout/WhyCard'
import InstructionBanner from '../components/ui/InstructionBanner'
import TimerBar from '../components/ui/TimerBar'
import { UserContext } from '../context/UserContext'
import shuffle from '../utils/shuffle'
import { getTimeLimit } from '../utils/time'
import { getApiBase } from '../utils/api'
import './PromptDartsGame.css'
import {
  type DartRound,
  ROUNDS,
  checkChoice,
  streakBonus,
} from './promptDartsHelpers'

const KEYWORDS = [
  'list',
  'draft',
  'summarize',
  'provide',
  'translate',
  'compose',
  'give',
  'write',
  'explain',
  'rewrite',
  'create',
  'share'
]

function highlightPrompt(text: string) {
  return text.split(' ').map((word, i) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '')
    const highlight = KEYWORDS.includes(clean) || /\d/.test(word)
    return (
      <span key={i} className={highlight ? 'hint-highlight' : undefined}>{word} </span>
    )
  })
}

export default function PromptDartsGame() {

  const { setPoints, user } = useContext(UserContext)
  const navigate = useNavigate()
  const [rounds, setRounds] = useState<DartRound[]>([])
  const [round, setRound] = useState(0)

  const [choice, setChoice] = useState<number | null>(null)

  const [choices, setChoices] = useState<string[]>(() =>
    rounds.length ? shuffle([...rounds[0].options]) : []
  )


  const [points, setPointsState] = useState(0)
  const [streak, setStreak] = useState(0)
  const [penaltyMsg, setPenaltyMsg] = useState('')

  const [hint, setHint] = useState<string | null>(null)
  const [hintUsed, setHintUsed] = useState(false)

  const PENALTY = 2
  const HINT_PENALTY = 2



  const TOTAL_TIME = getTimeLimit(user, {
    easy: 20,
    medium: 15,
    hard: 10,
  })
  const MAX_POINTS =
    user.difficulty === 'easy' ? 8 : user.difficulty === 'hard' ? 12 : 10

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [pointsLeft, setPointsLeft] = useState(MAX_POINTS)

  const current = rounds[round]

  // Load rounds from the server on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setRounds(shuffle(ROUNDS))
      return
    }
    const base = getApiBase()
    fetch(`${base}/api/darts`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length) {
          const fetched = data.map((r: DartRound) => ({
            options: r.options ?? [(r as any).bad, (r as any).good].filter(Boolean),
            correct: typeof (r as any).correct === 'number' ? (r as any).correct : 1,
            why: (r as any).why ?? '',
            response: (r as any).response ?? ''
          })) as DartRound[]
          setRounds(shuffle(fetched))
        } else {
          setRounds(shuffle(ROUNDS))
        }
      })
      .catch(() => setRounds(shuffle(ROUNDS)))
  }, [])



  useEffect(() => {
    if (!rounds.length || round >= rounds.length) return
    setTimeLeft(TOTAL_TIME)
    setPointsLeft(MAX_POINTS)
    setChoices(shuffle([...rounds[round].options]))


  }, [round, TOTAL_TIME, MAX_POINTS, rounds])



  useEffect(() => {
    if (choice !== null || timeLeft <= 0) return
    const id = setTimeout(() => {
      setTimeLeft(t => t - 1)
      setPointsLeft(p => Math.max(0, p - 1))
    }, 1000)
    return () => clearTimeout(id)
  }, [timeLeft, choice])

  useEffect(() => {
    if (timeLeft === 0 && choice === null) {
      setStreak(0)
    }
  }, [timeLeft, choice])

  function handleSelect(index: number) {
    const originalIndex = current.options.indexOf(choices[index])
    setChoice(originalIndex)
    if (checkChoice(current, originalIndex)) {
      setPointsState(s => s + pointsLeft + streakBonus(streak + 1))
      setStreak(s => s + 1)
      setPenaltyMsg('')
    } else {
      setPointsState(s => Math.max(0, s - PENALTY))
      setStreak(0)
      setPenaltyMsg(`Incorrect! -${PENALTY} points`)

    }
  }

  function revealHint() {
    if (hintUsed) return
    const clue = current.why.split(' ').slice(0, 6).join(' ')
    setHint(clue + (current.why.split(' ').length > 6 ? '...' : ''))
    setHintUsed(true)
    setPointsLeft(p => Math.max(0, p - HINT_PENALTY))
  }


  function next() {
    if (round + 1 < rounds.length) {
      setRound(r => r + 1)
      setChoice(null)
      setChoices(shuffle([...rounds[round + 1].options]))
      setTimeLeft(TOTAL_TIME)
      setPointsLeft(MAX_POINTS)
      setHint(null)
      setHintUsed(false)
    } else {
      setPoints('darts', points)
      setRound(r => r + 1)
    }
  }

  if (!rounds.length) {
    return (
      <div className="darts-page">
        <InstructionBanner>Loading rounds...</InstructionBanner>
      </div>
    )
  }

  if (round >= rounds.length) {
    return (
      <div className="darts-page">
        <CompletionModal
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
          buttonHref="/games/compose"
          buttonLabel="Play Compose Tweet"
        >
          <h3>Congratulations!</h3>
          <p className="final-score">Your points: {points}</p>
        </CompletionModal>
      </div>
    )
  }

  return (
    <div className="darts-page">
      <InstructionBanner>
        Choose the clearer prompt that best targets the requested format.
      </InstructionBanner>
      <div className="darts-wrapper">
        <WhyCard
          className="darts-sidebar"
          title="Why Clarity Matters"
          explanation="The clearer your target, the better your aim. Clear prompts act like aiming sights for AI."
          quote="Why Card: Why Clarity Matters"
          tip="Align prompt language with output types (teaching specificity and clarity)."
        />
        <div className="darts-game">
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
            alt="Strawberry throwing dart hitting 'Clear Prompt' bullseye on prompt darts target."
            className="hero-img"
            style={{ width: '200px' }}
          />

          <h3>Round {round + 1} of {rounds.length}</h3>
          <TimerBar timeLeft={timeLeft} TOTAL_TIME={TOTAL_TIME} />
          <p className="timer">Time: {timeLeft}s</p>
          <p className="points">Available points: {pointsLeft}</p>

          <p>Which prompt is clearer?</p>
          <div className="options">


            {choices.map((text, i) => (
              <button
                key={i}
                className="btn-primary"
                onClick={() => handleSelect(i)}
                disabled={choice !== null}
              >
                {highlightPrompt(text)}

              </button>
            ))}

          </div>
          <button
            className="btn-primary"
            onClick={revealHint}
            disabled={hintUsed || choice !== null}
          >
            Hint
          </button>
          {hint && <p className="hint-text">{hint}</p>}
          {choice !== null && (

            <>
              <p className="feedback">
                {checkChoice(current, choice!)
                  ? 'Correct! Clear prompts hit the bullseye.'
                  : 'Not quite. Aim for specific wording.'}
              </p>
              {penaltyMsg && !checkChoice(current, choice!) && (
                <p className="penalty">{penaltyMsg}</p>
              )}

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
            <button className="btn-primary" onClick={next}>
              {round + 1 < rounds.length ? 'Next Round' : 'Finish'}
            </button>
          )}
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/games/compose')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/games/compose">Skip to Compose</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
