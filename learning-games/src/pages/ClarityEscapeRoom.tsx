import { useState, useEffect, useContext } from 'react'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import { UserContext } from '../context/UserContext'
import './ClarityEscapeRoom.css'

type Task = {
  hint: string
  keywords: string[]
}

const TASKS: Task[] = [
  { hint: 'Improve this greeting', keywords: ['rewrite', 'formal'] },
  { hint: 'Fix this text', keywords: ['correct', 'grammar'] },
  { hint: 'Summarize the announcement', keywords: ['summarize', 'sentences'] },
  { hint: 'Format for email', keywords: ['email'] },
  { hint: 'Condense this paragraph', keywords: ['condense', 'paragraph'] },
]

export default function ClarityEscapeRoom() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const [door, setDoor] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScoreState] = useState(0)
  const [message, setMessage] = useState('')
  const [start] = useState(() => Date.now())

  const current = TASKS[door]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const lower = input.toLowerCase()
    const success = current.keywords.every(k => lower.includes(k))
    if (success) {
      const nextScore = score + 50
      setScoreState(nextScore)
      setMessage('The door unlocks with a click!')
      if (door + 1 === TASKS.length) {
        const time = Date.now() - start
        setScore('escape', nextScore)
        if (time < 180000 && !user.badges.includes('escape-artist')) {
          addBadge('escape-artist')
        }
        setDoor(TASKS.length)
      } else {
        setDoor(d => d + 1)
        setInput('')
      }
    } else {
      setScoreState(s => Math.max(0, s - 10))
      setMessage('Foggy response... try a clearer prompt!')
    }
  }

  useEffect(() => {
    if (door === TASKS.length) {
      setScore('escape', score)
    }
  }, [door, score, setScore])

  if (door === TASKS.length) {
    return (
      <div className="escape-page">
        <InstructionBanner>You escaped the room!</InstructionBanner>
        <p>Your score: {score}</p>
      </div>
    )
  }

  return (
    <div className="escape-page">
      <InstructionBanner>
        Enter a precise prompt to unlock each door.
      </InstructionBanner>
      <div className="escape-wrapper">
        <ProgressSidebar />
        <div className="room">
          <h3>Door {door + 1}</h3>
          <p className="hint">Hint: {current.hint}</p>
          <form onSubmit={handleSubmit} className="prompt-form">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your prompt"
            />
            <button type="submit">Submit</button>
          </form>
          {message && <p className="feedback">{message}</p>}
          <p>Score: {score}</p>
        </div>
      </div>
    </div>
  )
}


