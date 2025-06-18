import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { notify } from '../../shared/notify'
import { useRouter } from 'next/router'
import Tooltip from '../../components/ui/Tooltip'
import ProgressBar from '../../components/ui/ProgressBar'
import DoorAnimation from '../../components/DoorAnimation'
import DoorUnlockedModal from '../../components/ui/DoorUnlockedModal'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import shuffle from '../../utils/shuffle'
import styles from '../../styles/PromptGuessEscape.module.css'
import { scorePrompt } from '../../utils/scorePrompt'
import { generateRoomDescription } from '../../utils/generateRoomDescription'
import JsonLd from '../../components/seo/JsonLd'

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

const BASE_SCORE = 20
const BASE_TIME = 30
const FAIL_THRESHOLD = 3
const SCORE_DROP = 5
const EXTRA_TIME = 10


export default function PromptGuessEscape() {
  const router = useRouter()
  const { setPoints: recordScore, ageGroup } = useContext(UserContext) as UserContextType
  const [doors] = useState(() => shuffle(CLUES).slice(0, TOTAL_STEPS))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'success' | 'error' | ''>('')
  const [hintIndex, setHintIndex] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const [roundPoints, setRoundPoints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BASE_TIME)
  const [openPercent, setOpenPercent] = useState(0)
  const [failStreak, setFailStreak] = useState(0)
  const [scoreThreshold, setScoreThreshold] = useState(BASE_SCORE)
  const [roomDescription, setRoomDescription] = useState('')
  const startRef = useRef(Date.now())
  const [rounds, setRounds] = useState<{ prompt: string; expected: string; tip: string }[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [currentTip, setCurrentTip] = useState('')
  const [earned, setEarned] = useState(0)

  useEffect(() => {
    generateRoomDescription(ageGroup).then(text => setRoomDescription(text))
  }, [index, ageGroup])

  const clue = doors[index]

  useEffect(() => {
    const extra = failStreak >= FAIL_THRESHOLD ? EXTRA_TIME : 0
    setTimeLeft(BASE_TIME + extra)
    startRef.current = Date.now()
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setMessage("Time's up! The door remains closed.")
          setStatus('error')
          setRoundPoints(0)
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
        notify('Hint revealed \u2013 \u22122 points')
        setHintCount(c => c + 1)
        return i + 1
      }
      return i
    })
  }, [clue.hints])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Only trigger hint if user is NOT typing in an input field
      if (e.key.toLowerCase() === 'h' && 
          e.target && 
          (e.target as HTMLElement).tagName !== 'INPUT' && 
          (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault()
        revealHint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealHint])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { score, tips } = scorePrompt(clue.expectedPrompt, input.trim())
    if (score >= scoreThreshold) {
      const timeBonus = Date.now() - startRef.current < 10000 ? 5 : 0
      const penalty = hintCount * 2
      const total = Math.max(0, score + 10 + timeBonus - penalty)
      setPoints(p => p + total)

      setMessage(`Door unlocked! +${total} points`)
      setRoundPoints(total)
      setStatus('success')
      setOpenPercent(((index + 1) / TOTAL_STEPS) * 100)
      setShowTip(true)
      setShowNext(false)
      setMessage('')
      setFailStreak(0)
      setScoreThreshold(BASE_SCORE)
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
    }
  }

  function nextChallenge() {
    const { tips } = scorePrompt(clue.expectedPrompt, input.trim())
    const tip = tips[0] || 'Aim for a clearer prompt next time.'
    setRounds(r => [...r, { prompt: input.trim(), expected: clue.expectedPrompt, tip }])
    if (index + 1 < TOTAL_STEPS) {
      setIndex(i => i + 1)
      setInput('')
      setMessage('')
      setStatus('')
      setHintIndex(0)
      setHintCount(0)
      setShowNext(false)
    } else {
      recordScore('escape', points)
      setShowSummary(true)
    }
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Guess the Prompt Game',
          description: "Deduce the prompt from the AI's reply before time runs out.",
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png',
        }}      />
      <ModernGameLayout
        gameTitle="Guess the Prompt"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        whyCard={
          <WhyCard
            title="Why Reverse Engineering Matters"
            explanation="Understanding how AI interprets prompts helps you write better prompts. By working backwards from AI responses, you learn what makes prompts clear and effective."
            lesson={
              <div>
                <p><strong>Good prompts usually include:</strong></p>
                <ul>
                  <li><strong>Clear action:</strong> What you want the AI to do</li>
                  <li><strong>Context:</strong> Who, what, when, where</li>
                  <li><strong>Format:</strong> How you want the response</li>
                  <li><strong>Tone:</strong> The style of communication</li>
                </ul>
              </div>
            }
            examples={[
              {
                good: "Write a polite email to my teacher asking for help with math homework",
                bad: "Help me"
              }
            ]}
            tip="Look for clues in the AI's response about the original prompt. What tone was used? What action was requested? What context was provided?"
          />
        }
        nextGameButton={
          <button className="btn-primary" onClick={() => router.push('/games/dragdrop')}>
            Next: Drag & Drop →
          </button>
        }
      >
      <div className="guess-page">
      <div className={styles['guess-wrapper']}>
        <div className={styles['guess-game']}>
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
            alt="Detective strawberry examining clues"
            className="hero-img"
            style={{ width: '150px', display: 'inline-block' }}
          />
          <p className={styles['ai-response']}><strong>AI Response:</strong> "{clue.aiResponse}"</p>
          <p className={styles.timer}>Time left: {timeLeft}s</p>
          <form onSubmit={handleSubmit} className={styles['prompt-form']}>
            <label htmlFor="prompt-input">Your Prompt</label>
            <input
              id="prompt-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type the prompt that caused this reply"
            />
            <button type="submit" className="btn-primary">Submit</button>            <Tooltip message="Reveal a hint. Click the button or press H when not typing.">
              <button type="button" className="btn-primary" onClick={revealHint}>
                Hint
              </button>
            </Tooltip>
          </form>
          <ProgressBar percent={openPercent} />
          {hintIndex > 0 && (
            <div>
              {clue.hints.slice(0, hintIndex).map(h => (
                <Tooltip key={h} message={h}>
                  <span className={styles['hint-text']}>{h}</span>
                </Tooltip>
              ))}
            </div>
          )}
          {message && (
            <p className={`${styles.feedback} ${status}`}>{status === 'success' ? '✔️' : '⚠️'} {message}</p>
          )}
          {showNext && (
            <DoorUnlockedModal
              points={roundPoints}
              remaining={TOTAL_STEPS - (index + 1)}
              onNext={nextChallenge}
            />
          )}
        </div>
        <div className={styles['door-area']}>
          <DoorAnimation openPercent={openPercent} />        </div>
      </div>
      {showTip && (
        <div className={styles['summary-overlay']} onClick={() => {}}>
          <div className={styles['summary-modal']} onClick={e => e.stopPropagation()}>
            <p>You earned {earned} points!</p>
            <p className={styles.tip}><strong>Tip:</strong> {currentTip}</p>
            <button className="btn-primary" onClick={() => { setShowTip(false); nextChallenge(); }}>
              Continue
            </button>          </div>
        </div>
      )}
      {showSummary && (
        <div className={styles['summary-overlay']} onClick={() => setShowSummary(false)}>
          <div className={styles['summary-modal']} onClick={e => e.stopPropagation()}>
            <h3>Round Summary</h3>
            <ul>
              {rounds.map((r, i) => (
                <li key={i}>
                  <p><strong>Your Prompt:</strong> {r.prompt || '(none)'}</p>
                  <p><strong>Expected:</strong> {r.expected}</p>
                  <p className={styles.tip}><strong>Tip:</strong> {r.tip}</p>
                </li>
              ))}            </ul>            <button className="btn-primary" onClick={() => router.push('/community')}>
              View Community            </button>
          </div>
        </div>
      )}
        </div>
      </ModernGameLayout>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Guess the Prompt Game | StrawberryTech</title>
      <meta
        name="description"
        content="Deduce the prompt from the AI's reply before time runs out."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/guess" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
