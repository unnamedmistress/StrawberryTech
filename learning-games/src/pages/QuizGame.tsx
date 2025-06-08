import { useState, useEffect, useContext, useMemo } from 'react'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import './QuizGame.css'
import InstructionBanner from '../components/ui/InstructionBanner'
import { HALLUCINATION_EXAMPLES } from '../data/hallucinationExamples'

interface StatementSet {
  statements: string[]
  lieIndex: number
  category?: string
}

async function generateStatementSet(count = 3): Promise<StatementSet | null> {
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
              `Create ${count} short statements about general knowledge where exactly one is false. Respond strictly in JSON with fields "statements" and "lieIndex" indicating which index (0-${count - 1}) is the lie.`,
          },
          { role: 'user', content: 'Generate the statements now.' },
        ],
        temperature: 0.7,
      }),
    })
    const data = await resp.json()
    const text: string | undefined = data?.choices?.[0]?.message?.content?.trim()
    if (!text) return null
    // Extract JSON in case extra text was returned
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    if (
      Array.isArray(parsed.statements) &&
      typeof parsed.lieIndex === 'number'
    ) {
      return parsed as StatementSet
    }
  } catch (err) {
    console.error('AI generation failed', err)
  }
  return null
}

const ROUNDS: StatementSet[] = [
  {
    category: 'Science',
    statements: [
      'Bananas are berries.',
      'Venus is hotter than Mercury.',
      'Goldfish have a memory span of only three seconds.',
    ],
    lieIndex: 2,
  },
  {
    category: 'World Facts',
    statements: [
      'Adult humans have 206 bones.',
      'The Amazon River is the longest river in the world.',
      'The Eiffel Tower can be 15 cm taller during the summer.',
    ],
    lieIndex: 1,
  },
  {
    category: 'Human Body',
    statements: [
      'Honey never spoils.',
      'Mount Everest is the highest mountain above sea level.',
      'Humans can breathe and swallow at the same time.',
    ],
    lieIndex: 2,
  },
]

const QUOTE = 'Always verify surprising claims.'
const TIP = 'Tip: ask for sources when something sounds off.'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function ChallengeBanner() {
  return (
    <motion.div
      className="challenge-banner reveal"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      Ultimate Challenge: find the AI's lie! 🕵️
    </motion.div>
  )
}

function WhyItMatters() {
  const example = useMemo(
    () =>
      HALLUCINATION_EXAMPLES[Math.floor(Math.random() * HALLUCINATION_EXAMPLES.length)],
    [],
  )
  return (
    <aside className="quiz-sidebar reveal">
      <h3>Why It Matters</h3>
      <p>AI hallucinations occur when the system confidently states something untrue.</p>
      <blockquote className="sidebar-quote">{QUOTE}</blockquote>
      <p className="sidebar-tip">{TIP}</p>
      <p className="sidebar-example">
        Example: {example.statement}{' '}
        <a href={example.source} target="_blank" rel="noopener noreferrer">Source</a>
      </p>
    </aside>
  )
}

function ChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMsg],
        }),
      })
      const data = await resp.json()
      const text = data?.choices?.[0]?.message?.content?.trim() ?? ''
      if (text) {
        setMessages(prev => [...prev, { role: 'assistant', content: text }])
      }
    } catch (err) {
      console.error(err)
      toast.error('Unable to reach the API. Check your network or .env key.')
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Failed to get response.' },
      ])
    }
  }

  return (
    <div className="chatbox">
      <h3>Ask the Assistant</h3>
      <div className="chatbox-history">
        {messages.map((m, i) => (
          <p key={i}>{m.role === 'user' ? 'You: ' : 'Assistant: '}{m.content}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chatbox-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a question..."
        />
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  )
}

export default function QuizGame() {
  const { user, setScore, addBadge } = useContext(UserContext)
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [dynamicRound, setDynamicRound] = useState<StatementSet | null>(null)
  const [choice, setChoice] = useState<number | null>(null)
  const [score, setScoreState] = useState(0)
  const [played, setPlayed] = useState(0)
  const [streak, setStreak] = useState(0)
  const [numStatements, setNumStatements] = useState(() => {
    if (user.difficulty === 'hard') return 5
    if (user.difficulty === 'easy') return 3
    return 4
  })

  const current = dynamicRound ?? ROUNDS[round]
  const correct = choice === current.lieIndex

  function handleSelect(idx: number) {
    if (choice !== null) return
    setChoice(idx)
  }

  function refreshRound() {
    setChoice(null)
    generateStatementSet(numStatements).then((set) => {
      if (set) {
        setDynamicRound(set)
      } else {
        const next = Math.floor(Math.random() * ROUNDS.length)
        setRound(next)
        setDynamicRound(null)
      }
    })
  }

  function nextRound() {
    const wasCorrect = correct
    const newScore = wasCorrect ? score + 1 : score
    setScoreState(newScore)
    setPlayed(p => p + 1)
    setStreak(wasCorrect ? streak + 1 : 0)

    if (wasCorrect && streak + 1 >= 5 && !user.badges.includes('hallucination-hunter')) {
      addBadge('hallucination-hunter')
    }

    if (wasCorrect && numStatements < 6) {
      setNumStatements(n => n + 1)
    }

    if (played + 1 === ROUNDS.length) {
      setScore('quiz', newScore)
      if (newScore === ROUNDS.length && !user.badges.includes('quiz-whiz')) {
        addBadge('quiz-whiz')
      }
      toast.success(`You scored ${newScore} out of ${ROUNDS.length}`)
      setScoreState(0)
      setPlayed(0)
      setChoice(null)
      setRound(0)
      setDynamicRound(null)
      return
    }
    setChoice(null)
    generateStatementSet(numStatements).then((set) => {
      if (set) {
        setDynamicRound(set)
      } else {
        setRound((r) => (r + 1) % ROUNDS.length)
        setDynamicRound(null)
      }
    })
  }

  useEffect(() => {

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          obs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    refreshRound()


    return () => observer.disconnect()
  }, [])

  return (
    <div className="quiz-page">
      <ChallengeBanner />
      <InstructionBanner>
        Find the one false statement—the AI hallucination. Tap the refresh icon
        for new prompts and then select your answer.
      </InstructionBanner>
      <div className="truth-game">
        <WhyItMatters />
        <div className="game-area">
          <div className="statements">
          <div className="statement-header">
            <h2>Hallucinations</h2>
            <button
              className="refresh-btn btn-primary"
              onClick={refreshRound}
            aria-label="New statements"
          >
            🔄
          </button>
          </div>
          <p className="header-instruction">
            Pick the hallucination from the {numStatements} statements.
          </p>
          <p className="round-info">Round {round + 1} / {ROUNDS.length}</p>
          {current.category && (
            <p className="round-category">{current.category}</p>
          )}
          <ul className="statement-list">
            {current.statements.map((s, i) => (
              <li key={i}>
                <button
                className={`statement-btn btn-primary ${choice === i ? 'selected' : ''}`}
                onClick={() => handleSelect(i)}
                disabled={choice !== null}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
        {choice !== null && (
          <>
            <p className="feedback">
              {correct
                ? '✅ Correct! You spotted the hallucination.'
                : '❌ Incorrect. That one is true.'}
            </p>

            <button className="btn-primary" onClick={nextRound}>Next Round</button>

          </>
        )}
        </div>
        <ChatBox />
        </div>
        <ProgressSidebar />
        <div className="next-area">
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/leaderboard')}>Next</button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/leaderboard">Return to Progress</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
