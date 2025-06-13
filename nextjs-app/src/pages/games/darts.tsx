import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import TimerBar from '../../components/ui/TimerBar'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import shuffle from '../../utils/shuffle'
import { getTimeLimit } from '../../utils/time'
import styles from '../../styles/PromptDartsGame.module.css'
import HeadTag from 'next/head'
import JsonLd from '../../components/seo/JsonLd'
import CompletionModal from '../../components/ui/CompletionModal'
import { getApiBase } from '../../utils/api'

const CONGRATS_VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ'

const KEYWORDS = [
  'list',
  'draft',
  'summarize',
  'provide',
  'translate',
  'chain',
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
      <span key={i} className={highlight ? styles['hint-highlight'] : undefined}>{word} </span>
    )
  })
}

export interface DartRound {
  /** List of prompt options */
  options: string[]
  /** Index of the clearest prompt in the options array */
  correct: number
  why: string
  /** Example model response for the clear prompt */
  response: string
}


export const FALLBACK_ROUNDS: DartRound[] = [
  {
    options: [
      'Tell me about AI.',
      'List 3 use cases of AI in customer service.',
      'Share some general info about artificial intelligence.'
    ],
    correct: 1,
    why: 'The good prompt is specific about the desired output.',
    response: '1. Answer common questions\n2. Route tickets\n3. Provide 24/7 help'
  },
  {
    options: [
      'Write an email.',
      'Draft a 3-sentence email to a hiring manager explaining your interest.',
      'Send an email for me.'
    ],
    correct: 1,
    why: 'It clearly states the format and audience.',
    response: 'Dear Hiring Manager, ... (three sentences)'
  },
  {
    options: [
      'Explain climate change.',
      'Summarize 2 key causes of climate change in one paragraph.',
      'Describe the climate.'
    ],
    correct: 1,
    why: 'A concise request focuses the response.',
    response: 'The main causes are greenhouse gases and deforestation.'
  },
  {
    options: [
      'Summarize this article.',
      'Provide a two-sentence summary highlighting the main argument.',
      'Give me the gist.'
    ],
    correct: 1,
    why: 'Defining length keeps the summary tight.',
    response: 'Sentence one. Sentence two.'
  },
  {
    options: [
      'Translate this text.',
      'Translate the following text from English to Spanish.',
      'Help me with a translation.'
    ],
    correct: 1,
    why: 'Specifying languages makes the task clear.',
    response: 'Texto traducido al español.'
  },
  {
    options: [
      'Analyze our sales.',
      "List 3 key insights from last quarter's sales data in bullet form.",
      'Review the sales numbers.'
    ],
    correct: 1,
    why: 'The format and focus are spelled out.',
    response: '- Insight one\n- Insight two\n- Insight three'
  },
  {
    options: [
      'Write marketing copy.',
      'Create a prompt chain to research, analyze, and summarize climate change impacts.',
      'Tell people about our product.'
    ],
    correct: 1,
    why: 'Including format and detail improves clarity.',
    response: 'Check out our new product! It saves you time ⏱️ #NewRelease'
  },
  {
    options: [
      'Weather?',
      "Give today's weather forecast for Tokyo in Celsius.",
      'What is the weather like?'
    ],
    correct: 1,
    why: 'Location and units guide the response.',
    response: 'Today in Tokyo it will be 22°C with light rain.'
  },
  {
    options: [
      'Code a function.',
      'Write a Python function that reverses a string.',
      'Give me some code.'
    ],
    correct: 1,
    why: 'The good prompt specifies language and purpose.',
    response: 'def reverse_string(s):\n    return s[::-1]'
  },
  {
    options: [
      'Story please.',
      'Write a short bedtime story about a dragon who learns to code.',
      'Tell me something fun.'
    ],
    correct: 1,
    why: 'Topic and tone are defined.',
    response: 'Once upon a time, a curious dragon learned Python...'
  },
  {
    options: [
      'Advice on focus.',
      'Provide three tips for staying productive while working remotely.',
      'How do I stay focused?'
    ],
    correct: 1,
    why: 'Numbered tips make expectations clear.',
    response: '1. Keep a routine\n2. Set boundaries\n3. Take breaks'
  },
  {
    options: [
      'Help with calculus.',
      'Explain in two sentences how to find the derivative of x^2.',
      'Teach me calculus.'
    ],
    correct: 1,
    why: 'The good prompt constrains the explanation.',
    response: 'Use the power rule: bring down the exponent and subtract one.'
  },
  {
    options: [
      'Improve sentence.',
      'Rewrite the following sentence to sound more professional.',
      'Make this sound better.'
    ],
    correct: 1,
    why: 'The instruction is clearer about the goal.',
    response: 'Original: ... Revised: ...'
  },
  {
    options: [
      'List activities.',
      'Provide five kid-friendly indoor activities for a rainy day.',
      'Any fun ideas?'
    ],
    correct: 1,
    why: 'Quantity and audience are defined.',
    response: '1. Build a blanket fort...'
  },
  {
    options: [
      'History facts.',
      'Give a brief overview of the causes of the French Revolution.',
      'Share some history.'
    ],
    correct: 1,
    why: 'The good prompt specifies the scope.',
    response: 'High taxes and social inequality led to unrest...'
  },
  {
    options: [
      'Get user data.',
      'Create an SQL query to find the ten most recent orders.',
      'Find recent orders.'
    ],
    correct: 1,
    why: 'The request defines exactly what results are needed.',
    response: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;'
  },
  {
    options: [
      'Recipe ideas.',
      'Share a simple recipe for vegan chocolate chip cookies.',
      'What should I cook?'
    ],
    correct: 1,
    why: 'Specifying ingredients helps produce a useful recipe.',
    response: 'Mix flour, sugar, vegan butter and chocolate chips...'
  },
  {
    options: [
      'Explain quantum.',
      'Explain quantum entanglement in simple terms for beginners.',
      'Tell me about physics.'
    ],
    correct: 1,
    why: 'The audience is clearly defined.',
    response: 'Entanglement means two particles share a linked state even when far apart.'
  },
  {
    options: [
      'Fix my laptop.',
      "List three common solutions for a laptop that won't turn on.",
      'My laptop is broken.'
    ],
    correct: 1,
    why: 'Stating number and issue guides troubleshooting.',
    response: '1. Check the power cable\n2. Remove the battery\n3. Try a hard reset'
  },
  {
    options: [
      'Make an outline.',
      'Create a 5-point outline for a blog post about time management tips.',
      'Outline tips.'
    ],
    correct: 1,
    why: 'The structure and topic are spelled out.',
    response: 'I. Introduction ... V. Conclusion'
  }
]


export const ROUNDS: DartRound[] = FALLBACK_ROUNDS


export function checkChoice(round: DartRound, index: number) {
  return index === round.correct
}

export const STREAK_THRESHOLD = 3
export const STREAK_BONUS = 5

export function streakBonus(streak: number) {
  return streak > 0 && streak % STREAK_THRESHOLD === 0 ? STREAK_BONUS : 0
}

export default function PromptDartsGame() {

  const { setPoints, user } = useContext(UserContext) as UserContextType
  const router = useRouter()
  const [rounds, setRounds] = useState<DartRound[]>([])
  const [round, setRound] = useState(0)

  const [choice, setChoice] = useState<number | null>(null)

  const [choices, setChoices] = useState<string[]>(() =>
    rounds.length ? shuffle([...rounds[0].options]) : []
  )


  const [score, setScoreState] = useState(0)
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
          const fetched = data.map((r: any) => ({
            options: r.options ?? [r.bad, r.good].filter(Boolean),
            correct: typeof r.correct === 'number' ? r.correct : 1,
            why: r.why ?? '',
            response: r.response ?? ''
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
      setScoreState(s => s + pointsLeft + streakBonus(streak + 1))
      setStreak(s => s + 1)
      setPenaltyMsg('')
    } else {
      setScoreState(s => Math.max(0, s - PENALTY))
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
      setPoints('darts', score)
      setRound(r => r + 1)
    }
  }

  if (!rounds.length) {    return (
      <div className={styles['darts-page']}>
        <p>Loading rounds...</p>
      </div>
    )
  }

  if (round >= rounds.length) {
    return (
      <div className={styles['darts-page']}>
        <CompletionModal
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"          buttonHref="/games/chain"
          buttonLabel="Play Prompt Chain"
        >
          <h3>Congratulations!</h3>
          <p className={styles['final-score']}>Your points: {score}</p>
        </CompletionModal>
      </div>
    )
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Prompt Darts',
          description: 'Choose the clearer prompt to hit the bullseye and earn points.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png',
        }}
      />
      <HeadTag>
        <title>Prompt Darts - StrawberryTech</title>
        <meta property="og:title" content="Prompt Darts - StrawberryTech" />
        <meta
          property="og:description"
          content="Choose the clearer prompt to hit the bullseye and earn points."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
        />
        <meta
          property="og:url"
          content="https://strawberry-tech.vercel.app/games/darts"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prompt Darts - StrawberryTech" />
        <meta
          name="twitter:description"
          content="Choose the clearer prompt to hit the bullseye and earn points."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
        />
        <meta
          name="twitter:url"
          content="https://strawberry-tech.vercel.app/games/darts"
        />
      </HeadTag>
      <ModernGameLayout
        gameTitle="Prompt Darts"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png"
        whyCard={
          <WhyCard
            title="Why Clarity Wins"
            explanation="Clear, specific prompts help AI give you exactly what you want. In Prompt Darts, you'll learn to spot the most effective prompt by looking for details like format, audience, and constraints."
            lesson={<div>
              <ul>
                <li><strong>Be specific:</strong> State exactly what you want (e.g., 'List 3 tips' instead of 'Give advice').</li>
                <li><strong>Define format:</strong> Ask for a list, paragraph, or number of items.</li>
                <li><strong>Set context:</strong> Who is the answer for? What is the topic?</li>
                <li><strong>Constrain output:</strong> Limit length, style, or audience for better results.</li>
              </ul>
            </div>}
            tip="The more specific your prompt, the more useful the AI's answer will be!"
          />
        }
        nextGameButton={
          <button className="btn-primary" onClick={() => router.push('/games/chain')}>
            Next: Prompt Chain →
          </button>
        }
      >
        <div className={styles['darts-game']}>
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
          <div className={styles.options}>
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
          {hint && <p className={styles['hint-text']}>{hint}</p>}
          {choice !== null && (
            <>
              <p className={styles.feedback}>
                {checkChoice(current, choice!)
                  ? 'Correct! Clear prompts hit the bullseye.'
                  : 'Not quite. Aim for specific wording.'}
              </p>
              {penaltyMsg && !checkChoice(current, choice!) && (
                <p className="penalty">{penaltyMsg}</p>
              )}
              <p className={styles['why-message']}>{current.why}</p>
              <pre className={styles['canned-response']}>{current.response}</pre>
            </>
          )}
          {timeLeft === 0 && choice === null && (
            <p className={styles.feedback}>Time's up! No points this round.</p>
          )}
        </div>
      </ModernGameLayout>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Prompt Darts | StrawberryTech</title>
      <meta
        name="description"
        content="Choose the clearest prompt to hit the bullseye."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/darts" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
