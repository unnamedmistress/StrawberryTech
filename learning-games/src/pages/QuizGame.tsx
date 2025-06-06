import { useState } from 'react'
import './QuizGame.css'

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

function ChatBox() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setHistory((prev) => [...prev, q])
    setInput('')
  }

  return (
    <div className="chatbox">
      <h3>Ask the Assistant</h3>
      <div className="chatbox-history">
        {history.map((msg, i) => (
          <p key={i}>You: {msg}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chatbox-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

  function nextRound() {
    setChoice(null)
    setRound((r) => (r + 1) % ROUNDS.length)
  }

  return (
    <div className="truth-game">
      <div className="statements">
        <h2>3 Truths and a Lie</h2>
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
  )
}
