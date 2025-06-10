import { useState, useEffect, useContext, useMemo } from 'react'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import WhyCard from '../components/layout/WhyCard'
import { motion } from 'framer-motion'
import { notify } from '../shared/notify'
import { Link, useNavigate } from 'react-router-dom'
import CompletionModal from '../components/ui/CompletionModal'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import './QuizGame.css'
import InstructionBanner from '../components/ui/InstructionBanner'
import { HALLUCINATION_EXAMPLES } from '../data/hallucinationExamples'
import { H_ROUNDS } from '../data/hallucinationRounds'

interface StatementSet {
  statements: string[]
  lieIndex: number
  source: string
  correction: string
  category?: string
}


const ROUNDS: StatementSet[] = H_ROUNDS

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
    <WhyCard
      className="quiz-sidebar reveal"
      title="Why It Matters"
      explanation="AI hallucinations occur when the system confidently states something untrue."
      quote={QUOTE}
      tip={TIP}
    >
      <p className="sidebar-example">
        Example: {example.statement}{" "}
        <a href={example.source} target="_blank" rel="noopener noreferrer">
          Source
        </a>
      </p>
    </WhyCard>
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
      notify('Unable to reach the API. Check your network or .env key.')
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
  const { user, setPoints, addBadge } = useContext(UserContext) as UserContextType
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [points, setPointsState] = useState(0)
  const [played, setPlayed] = useState(0)
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const NUM_STATEMENTS = 3

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
    const wasCorrect = correct
    const newScore = wasCorrect ? points + 1 : points
    setPointsState(newScore)
    setPlayed(p => p + 1)
    setStreak(wasCorrect ? streak + 1 : 0)

    if (wasCorrect && streak + 1 >= 5 && !user.badges.includes('hallucination-hunter')) {
      addBadge('hallucination-hunter')
    }


    if (played + 1 === ROUNDS.length) {
      setPoints('quiz', newScore)
      if (newScore === ROUNDS.length && !user.badges.includes('quiz-whiz')) {
        addBadge('quiz-whiz')
      }
      notify(`You scored ${newScore} out of ${ROUNDS.length}`)
      setFinished(true)
      return
    }
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
    refreshRound()


    return () => observer.disconnect()
  }, [])

  return (
    <>
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
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
            alt="Detective-themed strawberry examining statement cards under magnifying glass to spot false claim."
            className="hero-img"
            style={{ width: '150px', display: 'inline-block' }}
          />
          <p className="header-instruction">
            Pick the hallucination from the {NUM_STATEMENTS} statements.
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
            <p className="feedback-source">
              The hallucination was: "{current.statements[current.lieIndex]}".{' '}
              <a href={current.source} target="_blank" rel="noopener noreferrer">
                Article
              </a>
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
            <button
              className="btn-primary"
              onClick={() => navigate('/games/escape')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/leaderboard">Return to Progress</Link>
          </p>
        </div>
      </div>
    </div>
    {finished && (
      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
        buttonHref="/games/escape"
        buttonLabel="Play Escape Room"
      >
        <h3>You finished the quiz!</h3>
        <p className="final-score">Your points: {points}</p>
      </CompletionModal>
    )}
    </>
  )
}
