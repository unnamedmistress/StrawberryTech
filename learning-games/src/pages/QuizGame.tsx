import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import './QuizGame.css'
import InstructionBanner from '../components/ui/InstructionBanner'

interface StatementSet {
  statements: string[]
  lieIndex: number
}

const ROUNDS: StatementSet[] = [
  {
    statements: [
      'Bananas are berries.',
      'Venus is hotter than Mercury.',
      'Goldfish have a memory span of only three seconds.',
    ],
    lieIndex: 2,
  },
  {
    statements: [
      'Adult humans have 206 bones.',
      'The Amazon River is the longest river in the world.',
      'The Eiffel Tower can be 15 cm taller during the summer.',
    ],
    lieIndex: 1,
  },
  {
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
  return (
    <aside className="quiz-sidebar reveal">
      <h3>Why It Matters</h3>
      <p>AI hallucinations occur when the system confidently states something untrue.</p>
      <blockquote className="sidebar-quote">{QUOTE}</blockquote>
      <p className="sidebar-tip">{TIP}</p>
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
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default function QuizGame() {
  const [round, setRound] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)

  const current = ROUNDS[round]
  const correct = choice === current.lieIndex

  function handleSelect(idx: number) {
    if (choice !== null) return
    setChoice(idx)
  }

  function refreshRound() {
    setChoice(null)
    const next = Math.floor(Math.random() * ROUNDS.length)
    setRound(next)
  }

  function nextRound() {
    setChoice(null)
    setRound((r) => (r + 1) % ROUNDS.length)
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

    return () => observer.disconnect()
  }, [])

  return (
    <div className="quiz-page">
      <ChallengeBanner />
      <InstructionBanner>
        Find the one false statement—the AI hallucination. Tap the refresh icon
        for new prompts and then select your answer.
      </InstructionBanner>
      <WhyItMatters />
      <div className="truth-game">
        <div className="statements">
          <div className="statement-header">
            <h2>3 Truths and a Lie</h2>
            <button
              className="refresh-btn"
              onClick={refreshRound}
            aria-label="New statements"
          >
            🔄
          </button>
          </div>
          <p className="round-info">Round {round + 1} / {ROUNDS.length}</p>
          <ul className="statement-list">
            {current.statements.map((s, i) => (
              <li key={i}>
                <button
                className={`statement-btn ${choice === i ? 'selected' : ''}`}
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
            <button onClick={nextRound}>Next Round</button>
          </>
        )}
        </div>
        <ChatBox />
      </div>
    </div>
  )
}
