import { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import CompletionModal from '../components/ui/CompletionModal'
import InstructionBanner from '../components/ui/InstructionBanner'
import ProgressBar from '../components/ui/ProgressBar'
import DoorAnimation from '../components/DoorAnimation'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import WhyCard from '../components/layout/WhyCard'
import Tooltip from '../components/ui/Tooltip'
import IntroOverlay from '../components/ui/IntroOverlay'
import shuffle from '../utils/shuffle'
import './ClarityEscapeRoom.css'
import { scorePrompt } from '../utils/scorePrompt'
import { generateRoomDescription } from '../utils/generateRoomDescription'
import { UserContext } from '../context/UserContext'

interface Clue {
  aiResponse: string
  expectedPrompt: string
  hints: string[]
}

const CLUES: Clue[] = [
  {
    aiResponse: "Here's a fun joke: Why don't skeletons fight each other? They don't have the guts!",
    expectedPrompt: 'Tell me a kid-friendly joke',
    hints: [
      'The subject is humor suitable for children.',
      "The verb asks to 'tell' something funny.",
    ],
  },
  {
    aiResponse: 'This thank-you note expresses deep gratitude to a teacher for their support.',
    expectedPrompt: 'Write a thank-you note to a teacher',
    hints: [
      "It's about appreciating an educator.",
      "The key verb is 'write'.",
    ],
  },
  {
    aiResponse: 'A healthy meal plan for teens should include protein, whole grains, and veggies.',
    expectedPrompt: 'Suggest a healthy weekly meal plan for teenagers',
    hints: [
      'Topic relates to nutrition for teens.',
      "The verb asks to 'suggest' meals.",
    ],
  },
  {
    aiResponse: 'To improve sleep, reduce screen time before bed and maintain a consistent schedule.',
    expectedPrompt: 'Give sleep hygiene tips for students',
    hints: [
      'Focuses on better rest for students.',
      "The verb asks to 'give' advice.",
    ],
  },
  {
    aiResponse: 'The mitochondria is the powerhouse of the cell. It generates energy through respiration.',
    expectedPrompt: 'Explain what mitochondria does in a cell',
    hints: [
      "It's about a part of a cell that makes energy.",
      "The verb is 'explain'.",
    ],
  },
  {
    aiResponse: 'For a 50-year-old man, a basic workout includes stretching, walking, and light weights.',
    expectedPrompt: 'Write a workout routine for a man in his 50s',
    hints: [
      'Concerns fitness for a middle-aged man.',
      "Starts with the verb 'write'.",
    ],
  },
  {
    aiResponse: 'The water cycle includes evaporation, condensation, precipitation, and collection.',
    expectedPrompt: 'Describe the steps of the water cycle',
    hints: [
      'Topic involves evaporation and precipitation.',
      "Uses the verb 'describe'.",
    ],
  },
  {
    aiResponse: 'A persuasive paragraph includes a claim, evidence, and a strong conclusion.',
    expectedPrompt: 'How do you write a persuasive paragraph?',
    hints: [
      'About constructing convincing writing.',
      "Includes the verb 'write'.",
    ],
  },
  {
    aiResponse: 'A simple Python function to reverse a string uses slicing: return s[::-1]',
    expectedPrompt: 'Show how to reverse a string in Python',
    hints: [
      'Deals with coding in a popular language.',
      "The verb is 'show'.",
    ],
  },
  {
    aiResponse: 'The economic causes of the French Revolution include debt, taxation, and inequality.',
    expectedPrompt: 'Summarize the economic causes of the French Revolution',
    hints: [
      'Concerns French history and its finances.',
      "Begins with the verb 'summarize'.",
    ],
  },
]

const TOTAL_STEPS = 4

// Difficulty tuning constants mirrored from PromptGuessEscape
const BASE_SCORE = 20
const BASE_TIME = 30
const FAIL_THRESHOLD = 3
const SCORE_DROP = 5
const EXTRA_TIME = 10


export default function ClarityEscapeRoom() {
  const navigate = useNavigate()
  const { setPoints: recordScore } = useContext(UserContext)
  const [doors] = useState(() => shuffle(CLUES).slice(0, TOTAL_STEPS))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [points, setPointsState] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'success' | 'error' | ''>('')
  const [hintIndex, setHintIndex] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const [timeLeft, setTimeLeft] = useState(BASE_TIME)
  const [openPercent, setOpenPercent] = useState(0)

  const [failStreak, setFailStreak] = useState(0)
  const [scoreThreshold, setScoreThreshold] = useState(BASE_SCORE)

  const [roomDescription, setRoomDescription] = useState('')

  const [aiHint, setAiHint] = useState('')
  const startRef = useRef(Date.now())
  const [showIntro, setShowIntro] = useState(true)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    generateRoomDescription().then(text => setRoomDescription(text))
  }, [index])

  const clue = doors[index]

  useEffect(() => {
    const extra = failStreak >= FAIL_THRESHOLD ? EXTRA_TIME : 0
    setTimeLeft(BASE_TIME + extra)
    startRef.current = Date.now()
    setAiHint('')
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setMessage("Time's up! The door remains closed.")
          setStatus('error')
          setShowNext(true)
          setFailStreak(fs => {
            const next = fs + 1
            if (next >= FAIL_THRESHOLD) {
              setScoreThreshold(s => Math.max(1, s - SCORE_DROP))
            }
            return next
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [index, failStreak])

  const revealHint = useCallback(() => {
    setHintIndex(i => {
      if (i < clue.hints.length) {
        toast('Hint revealed \u2013 \u22122 points')
        setHintCount(c => c + 1)
        return i + 1
      }
      return i
    })
  }, [clue.hints])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault()
        revealHint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealHint])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowIntro(false)
      }
    }
    if (showIntro) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [showIntro])

  async function fetchAiHint(guess: string) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Provide a single short hint referencing the user\'s guess without revealing the answer.',
            },
            {
              role: 'user',
              content: `The correct prompt is "${clue.expectedPrompt}". The user guessed "${guess}". Give a helpful hint in under 15 words.`,
            },
          ],
          max_tokens: 30,
          temperature: 0.7,
        }),
      })
      const data = await resp.json()
      const hintText: string | undefined = data?.choices?.[0]?.message?.content
      if (hintText) {
        setAiHint(hintText.trim())
      }
    } catch (err) {
      console.error(err)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { score, tips } = scorePrompt(clue.expectedPrompt, input.trim())
    if (score >= scoreThreshold) {
      const timeBonus = Date.now() - startRef.current < 10000 ? 5 : 0
      const penalty = hintCount * 2
      const total = Math.max(0, score + 10 + timeBonus - penalty)
      setPointsState(p => p + total)
      setMessage(`Door unlocked! +${total} points`)
      setStatus('success')
      setOpenPercent(((index + 1) / TOTAL_STEPS) * 100)
      setShowNext(true)

      setFailStreak(0)
      setScoreThreshold(BASE_SCORE)

      setAiHint('')

    } else {
      const tipText = tips.join(' ')
      setMessage(`Too vague. ${tipText}`)
      setStatus('error')
      setFailStreak(fs => {
        const next = fs + 1
        if (next >= FAIL_THRESHOLD) {
          setScoreThreshold(s => Math.max(1, s - SCORE_DROP))
        }
        return next
      })
      setAiHint('')
      fetchAiHint(input.trim())
    }
  }

  function nextChallenge() {
    // Previously we recorded each prompt and tip for a summary modal. The new
    // completion modal omits that detail, so we simply advance the round.
    if (index + 1 < TOTAL_STEPS) {
      setIndex(i => i + 1)
      setInput('')
      setMessage('')
      setStatus('')
      setHintIndex(0)
      setHintCount(0)

      setAiHint('')

      setShowNext(false)
    } else {
      recordScore('escape', points)
      setShowSummary(true)
    }
  }

  return (
    <>
      {showIntro && <IntroOverlay onClose={() => setShowIntro(false)} />}
      <div className="escape-page">
      <InstructionBanner>Escape Room: Guess the Prompt</InstructionBanner>
      <div className="escape-wrapper">
        <WhyCard
          className="escape-sidebar"
          title="Why Clarity Matters"
          explanation="Vague inputs lock AI in confusion loops; precise prompts open doors."
        />
        <div className="room">
          <div className="room-grid">
            <div className="room-main">
              {roomDescription && (
                <p className="room-description">{roomDescription}</p>
              )}
              <p className="ai-response"><strong>AI Response:</strong> "{clue.aiResponse}"</p>
              <p className="timer">Time left: {timeLeft}s</p>
              <form onSubmit={handleSubmit} className="prompt-form">
                <label htmlFor="prompt-input">Your prompt</label>
                <input
                  id="prompt-input"
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 100))}
                  placeholder="Type the prompt that caused this reply"
                />
                <button type="submit" className="btn-primary">Submit</button>
                <Tooltip message="Reveal a hint (press H). Each hint reduces your points.">
                  <button type="button" className="btn-primary" onClick={revealHint}>
                    Hint (H)
                  </button>
                </Tooltip>
              </form>
              <ProgressBar percent={openPercent} />
              {hintIndex > 0 && (
                <div>
                  {clue.hints.slice(0, hintIndex).map(h => (
                    <Tooltip key={h} message={h}>
                      <span className="hint-text">{h}</span>
                    </Tooltip>
                  ))}
                  {aiHint && (
                    <Tooltip message={aiHint}>
                      <span className="hint-text">{aiHint}</span>
                    </Tooltip>
                  )}
                </div>
              )}
              {message && (
                <p className={`feedback ${status}`}>{status === 'success' ? '✔️' : '⚠️'} {message}</p>
              )}
              {showNext && (
                <div className="next-area">
                  <button className="btn-primary" onClick={nextChallenge}>Next Challenge</button>
                </div>
              )}
              <p className="score">Score: {points}</p>
            </div>
            <div className="door-area">
              <DoorAnimation openPercent={openPercent} />
            </div>
          </div>
        </div>
        <ProgressSidebar />
        <div className="next-area">
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/games/recipe')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/games/recipe">Skip to Prompt Builder</Link>
          </p>
        </div>
      </div>
      {showSummary && (
        <CompletionModal
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          buttonHref="/games/recipe"
          buttonLabel="Play Prompt Builder"
        >
          <h3>Escape Complete!</h3>
          <p className="final-score">Points: {points}</p>
        </CompletionModal>
      )}
    </div>
    </>
  )
}
