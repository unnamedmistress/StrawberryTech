import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'

import ProgressBar from '../components/ui/ProgressBar'

import DoorAnimation from '../components/DoorAnimation'

import { UserContext } from '../context/UserContext'
import './ClarityEscapeRoom.css'

type Task = {
  hint: string
  keywords: string[]
}

const TASKS: Task[] = [
  { hint: 'Draft an email', keywords: ['draft', 'email'] },
  { hint: 'Improve this greeting', keywords: ['rewrite', 'formal'] },
  { hint: 'Fix this text', keywords: ['correct', 'grammar'] },
  { hint: 'Summarize the announcement', keywords: ['summarize', 'sentences'] },
  { hint: 'Format for email', keywords: ['email'] },
  { hint: 'Condense this paragraph', keywords: ['condense', 'paragraph'] },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function ClarityEscapeRoom() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const [door, setDoor] = useState(0)
  const [tasks] = useState<Task[]>(() => shuffle(TASKS))
  const [input, setInput] = useState('')
  const [score, setScoreState] = useState(0)
  const [message, setMessage] = useState('')
  const [start] = useState(() => Date.now())
  const [timeLeft, setTimeLeft] = useState(30)
  const [openPercent, setOpenPercent] = useState(0)
  const [hintVisible, setHintVisible] = useState(false)
  const [openPercent, setOpenPercent] = useState(0)

  const segments = [
    'The door creaks open a little.',
    'A sliver of light spills through.',
    'Almost there, keep going...',
    'The door swings wide open!'
  ]
  const [revealIndex, setRevealIndex] = useState(0)

  const current = tasks[door]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const lower = input.toLowerCase()
    const success = current.keywords.every(k => lower.includes(k))
    if (success) {
      const nextScore = score + 50
      setScoreState(nextScore)
      setMessage('The door unlocks with a click!')
      const newDoor = door + 1
      setOpenPercent((newDoor / tasks.length) * 100)
      if (newDoor === tasks.length) {
        const time = Date.now() - start
        setScore('escape', nextScore)
        if (time < 180000 && !user.badges.includes('escape-artist')) {
          addBadge('escape-artist')
        }
        setDoor(tasks.length)
      } else {
        setDoor(newDoor)
        setInput('')
      }
    } else {
      setScoreState(s => Math.max(0, s - 10))
      setMessage('Foggy response... try a clearer prompt!')
    }
  }

  function showHint() {
    if (!hintVisible) {
      setHintVisible(true)
      setScoreState(s => Math.max(0, s - 5))
    }
  }

  useEffect(() => {
    setTimeLeft(30)
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setScoreState(s => Math.max(0, s - 20))
          setMessage('Too slow! The door remains locked.')
          setInput('')
          setHintVisible(false)
          return 30
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [door])

  useEffect(() => {
    setHintVisible(false)
  }, [door])

  useEffect(() => {

    const percent = Math.round((door / tasks.length) * 100)
    setOpenPercent(percent)
  }, [door, tasks.length])

  useEffect(() => {
    const thresholds = [25, 50, 75, 100]
    for (let i = 0; i < thresholds.length; i++) {
      if (openPercent >= thresholds[i] && revealIndex < i + 1) {
        setRevealIndex(i + 1)
      }
    }
  }, [openPercent, revealIndex])

  useEffect(() => {

    if (door === tasks.length) {
      setScore('escape', score)
    }
  }, [door, score, setScore, tasks.length])

  if (door === tasks.length) {
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
        <aside className="escape-sidebar">
          <h3>Why Clarity Matters</h3>
          <p>Vague inputs lock AI in confusion loops; precise prompts open doors.</p>
          <blockquote className="sidebar-quote">Why Card: Why Clarity Matters</blockquote>
          <p className="sidebar-tip">Shows how specificity opens doors—literally. Teaching players to apply intent, tone, and task format.</p>
        </aside>
        <div className="room">
          <h3>{current.hint}</h3>
          <p className="hint">Door {door + 1}</p>
          <p className="timer">Time left: {timeLeft}s</p>
          <p className="door-progress">
            {segments.slice(0, revealIndex).map((text, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'block' }}
              >
                {text}
              </motion.span>
            ))}
          </p>

          <DoorAnimation openPercent={openPercent} />

          <form onSubmit={handleSubmit} className="prompt-form">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your prompt"
            />
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" onClick={showHint} className="btn-primary">Hint</button>
          </form>
          <ProgressBar percent={openPercent} />
          {hintVisible && (
            <p className="hint-keywords">Keywords: {current.keywords.join(', ')}</p>
          )}
          {message && <p className="feedback">{message}</p>}
          <p className="score">Score: {score}</p>
        </div>
        <ProgressSidebar />
        <div className="next-area" />
      </div>
    </div>
  )
}


