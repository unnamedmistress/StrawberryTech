import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructionBanner from '../components/ui/InstructionBanner'
import Tooltip from '../components/ui/Tooltip'
import ProgressBar from '../components/ui/ProgressBar'
import DoorAnimation from '../components/DoorAnimation'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import { UserContext } from '../context/UserContext'
import shuffle from '../utils/shuffle'
import './PromptGuessEscape.css'
import { scorePrompt } from '../utils/scorePrompt'

interface Clue {
  aiResponse: string
  expectedPrompt: string
  hint: string
}

const CLUES: Clue[] = [
  {
    aiResponse: "Here's a fun joke: Why don't skeletons fight each other? They don't have the guts!",
    expectedPrompt: 'Tell me a kid-friendly joke',
    hint: 'Try asking for a joke suitable for children.'
  },
  {
    aiResponse: 'This thank-you note expresses deep gratitude to a teacher for their support.',
    expectedPrompt: 'Write a thank-you note to a teacher',
    hint: 'Think about thanking a teacher in a short note.'
  },
  {
    aiResponse: 'A healthy meal plan for teens should include protein, whole grains, and veggies.',
    expectedPrompt: 'Suggest a healthy weekly meal plan for teenagers',
    hint: 'Mention a healthy weekly meal plan for teens.'
  },
  {
    aiResponse: 'To improve sleep, reduce screen time before bed and maintain a consistent schedule.',
    expectedPrompt: 'Give sleep hygiene tips for students',
    hint: 'Ask for sleep hygiene tips aimed at students.'
  },
  {
    aiResponse: 'The mitochondria is the powerhouse of the cell. It generates energy through respiration.',
    expectedPrompt: 'Explain what mitochondria does in a cell',
    hint: 'Request a short explanation of mitochondria.'
  },
  {
    aiResponse: 'For a 50-year-old man, a basic workout includes stretching, walking, and light weights.',
    expectedPrompt: 'Write a workout routine for a man in his 50s',
    hint: 'Mention a workout routine for someone in his 50s.'
  },
  {
    aiResponse: 'The water cycle includes evaporation, condensation, precipitation, and collection.',
    expectedPrompt: 'Describe the steps of the water cycle',
    hint: 'Think about describing each step of the water cycle.'
  },
  {
    aiResponse: 'A persuasive paragraph includes a claim, evidence, and a strong conclusion.',
    expectedPrompt: 'How do you write a persuasive paragraph?',
    hint: 'You want instructions for writing a persuasive paragraph.'
  },
  {
    aiResponse: 'A simple Python function to reverse a string uses slicing: return s[::-1]',
    expectedPrompt: 'Show how to reverse a string in Python',
    hint: 'Ask for Python code that reverses a string.'
  },
  {
    aiResponse: 'The economic causes of the French Revolution include debt, taxation, and inequality.',
    expectedPrompt: 'Summarize the economic causes of the French Revolution',
    hint: 'Request a short summary of the French Revolution\'s economic causes.'
  }
]


export default function PromptGuessEscape() {
  const navigate = useNavigate()
  const { setScore } = useContext(UserContext)
  const [doors] = useState(() => shuffle(CLUES))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'success' | 'error' | ''>('')
  const [showHint, setShowHint] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [openPercent, setOpenPercent] = useState(0)
  const startRef = useRef(Date.now())

  const clue = doors[index]

  useEffect(() => {
    setTimeLeft(30)
    startRef.current = Date.now()
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
    const { score, tips } = scorePrompt(clue.expectedPrompt, input.trim())
    if (score >= 20) {
      const timeBonus = Date.now() - startRef.current < 10000 ? 5 : 0
      const total = score + 10 + timeBonus
      setPoints(p => p + total)
      setMessage(`Door unlocked! +${total} points`)
      setStatus('success')
      setOpenPercent(((index + 1) / doors.length) * 100)
      setShowNext(true)
    } else {
      const tipText = tips.join(' ')
      setMessage(`Too vague. ${tipText}`)
      setStatus('error')
    }
  }

  function nextChallenge() {
    if (index + 1 < doors.length) {
      setIndex(i => i + 1)
      setInput('')
      setMessage('')
      setStatus('')
      setShowHint(false)
      setShowNext(false)
    } else {
      setScore('escape', points)
      navigate('/leaderboard')
    }
  }

  return (
    <div className="guess-page">
      <InstructionBanner>Escape Room: Guess the Prompt</InstructionBanner>
      <div className="guess-wrapper">
        <aside className="guess-sidebar">
          <h3>Why Clarity Matters</h3>
          <p>Vague inputs lock AI in confusion loops; precise prompts open doors.</p>
        </aside>
        <div className="guess-game">
          <p className="ai-response"><strong>AI Response:</strong> "{clue.aiResponse}"</p>
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
          <ProgressBar percent={openPercent} />
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
        <div className="door-area">
          <DoorAnimation openPercent={openPercent} />
        </div>
        <ProgressSidebar />
      </div>
    </div>
  )
}
