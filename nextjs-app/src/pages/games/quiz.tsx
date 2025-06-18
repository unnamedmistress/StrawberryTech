import { useState, useEffect, useContext, useMemo } from 'react'
import WhyCard from '../../components/layout/WhyCard'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import { motion } from 'framer-motion'
import { notify } from '../../shared/notify'
import Link from 'next/link'; import { useRouter } from 'next/router'
import CompletionModal from '../../components/ui/CompletionModal'
import HeadTag from 'next/head'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import styles from '../../styles/QuizGame.module.css'
import { HALLUCINATION_EXAMPLES } from '../../data/hallucinationExamples'
import { H_ROUNDS } from '../../data/hallucinationRounds'
import JsonLd from '../../components/seo/JsonLd'

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

function ChatBox() {
  const { ageGroup } = useContext(UserContext) as UserContextType
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const systemMsg = {
    role: 'system' as const,
    content: `Reply in one short sentence for a ${ageGroup} player.`,
  }

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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [systemMsg, ...messages, userMsg],
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
    <div className={styles.chatbox}>
      <h3>Ask the Assistant</h3>
      <div className={styles['chatbox-history']}>
        {messages.map((m, i) => (
          <p key={i}>{m.role === 'user' ? 'You: ' : 'Assistant: '}{m.content}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles['chatbox-input']}>
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
  const router = useRouter()
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
    <>      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Hallucination Quiz',
          description: "Spot the AI's false statement among the truths.",
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png',
        }}
      />
        <HeadTag>
        <title>Hallucinations Quiz - StrawberryTech</title>
        <meta property="og:title" content="Hallucinations Quiz - StrawberryTech" />
        <meta
          property="og:description"
          content="Spot the single AI hallucination hidden among truthful statements."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
        />
        <meta
          property="og:url"
          content="https://strawberry-tech.vercel.app/games/quiz"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hallucinations Quiz - StrawberryTech" />
        <meta
          name="twitter:description"
          content="Spot the single AI hallucination hidden among truthful statements."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
        />
          <meta
            name="twitter:url"
            content="https://strawberry-tech.vercel.app/games/quiz"
          />
        </HeadTag>
      
      <ModernGameLayout
        gameTitle="Hallucinations"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
        whyCard={
          <WhyCard
            title="Why It Matters"
            explanation="AI hallucinations occur when an AI system confidently states something untrue. Learn to spot these to verify AI-generated content."
            quote="Always verify surprising claims."
            tip="Tip: ask for sources when something sounds off."
          />
        }        nextGameButton={
          <button
            className="btn-primary"
            onClick={() => router.push('/games/escape')}
          >
            Next Game
          </button>
        }
      >
        <div className={styles['game-area']}>
          <div className={styles.statements}>
          <div className={styles['statement-header']}>
            <h2>Hallucinations</h2>
            <button
              className={`refresh-btn btn-primary ${styles['refresh-btn']}`}
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
          <p className={styles['header-instruction']}>
            Pick the hallucination from the {NUM_STATEMENTS} statements.
          </p>
          <p className={styles['round-info']}>Round {round + 1} / {ROUNDS.length}</p>
          {current.category && (
            <p className={styles['round-category']}>{current.category}</p>
          )}
          <ul className={styles['statement-list']}>
            {current.statements.map((s, i) => (
              <li key={i}>
                <button
                className={`statement-btn btn-primary ${choice === i ? styles.selected : ''}`}
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
            <p className={styles.feedback}>
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
            
            {played > 0 && (
              <button 
                className="btn-secondary" 
                onClick={() => router.push('/games/escape')}
                style={{ marginLeft: '1rem' }}
              >
                Next Game →
              </button>
            )}

          </>
        )}
        </div>
        <ChatBox />
        </div>
      </ModernGameLayout>
    {finished && (
      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png"
        buttonHref="/games/escape"
        buttonLabel="Play Escape Room"
      >
        <h3>You finished the quiz!</h3>
        <p className={styles['final-score']}>Your points: {points}</p>
      </CompletionModal>
    )}
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Hallucination Quiz | StrawberryTech</title>
      <meta
        name="description"
        content="Spot the AI's false statement among the truths."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/quiz" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
