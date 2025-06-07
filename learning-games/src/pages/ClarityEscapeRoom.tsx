import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'

import ProgressBar from '../components/ui/ProgressBar'

import DoorAnimation from '../components/DoorAnimation'

import { UserContext } from '../context/UserContext'
import './ClarityEscapeRoom.css'

type Task = {
  hint: string
  /**
   * System prompt used when asking the language model if the
   * player's input satisfies the hint. The model should reply
   * with only "yes" or "no".
   */
  checkPrompt: string
}

const TASKS: Task[] = [
  {
    hint: 'Write a short email canceling a meeting',
    checkPrompt:
      'Does the player ask the AI to politely cancel a meeting via email?'
  },
  {
    hint: 'Summarize your day in one sentence',
    checkPrompt: 'Is the player requesting a one sentence summary of a day?'
  },
  {
    hint: 'Suggest weekend plans for a family',
    checkPrompt: 'Is the user asking for family friendly weekend plans?'
  },
  {
    hint: 'Share a quick morning workout',
    checkPrompt: 'Does the prompt request a morning exercise routine?'
  },
  {
    hint: 'Write a thank-you note to a teacher',
    checkPrompt: 'Is the input about thanking a teacher in a short note?'
  },
  {
    hint: 'Give tips for being more productive',
    checkPrompt: 'Is the player asking for productivity tips?'
  },
  {
    hint: 'Paraphrase the quote "Knowledge is power"',
    checkPrompt: 'Does the prompt request a paraphrase of the quote "Knowledge is power"?'
  },
  {
    hint: 'Translate "good morning" to Spanish',
    checkPrompt: 'Is the player asking to translate "good morning" into Spanish?'
  },
  {
    hint: 'Share a quick pasta recipe',
    checkPrompt: 'Does the input seek a short pasta recipe?'
  },
  {
    hint: 'Compose a tweet about reading a new book',
    checkPrompt: 'Is the player trying to craft a short social post about a new book?'
  }
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function evaluatePrompt(task: Task, inputText: string): Promise<boolean> {
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
            content: `${task.checkPrompt} Reply only with yes or no.`,
          },
          { role: 'user', content: inputText },
        ],
        max_tokens: 1,
        temperature: 0,
      }),
    })
    const data = await resp.json()
    const text: string = data?.choices?.[0]?.message?.content?.trim().toLowerCase() ?? ''
    return text.startsWith('yes')
  } catch (err) {
    console.error(err)
    return false
  }
}

export default function ClarityEscapeRoom() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const BASE_TIME =
    user.difficulty === 'easy' ? 45 : user.difficulty === 'hard' ? 20 : 30
  const [door, setDoor] = useState(0)
  const [tasks] = useState<Task[]>(() => shuffle(TASKS))
  const [input, setInput] = useState('')
  const [score, setScoreState] = useState(0)
  const [message, setMessage] = useState('')
  const [start] = useState(() => Date.now())
  const [timeLeft, setTimeLeft] = useState(BASE_TIME)
  const [openPercent, setOpenPercent] = useState(0)
  const [hintVisible, setHintVisible] = useState(false)

  const segments = [
    'The door creaks open a little.',
    'A sliver of light spills through.',
    'Almost there, keep going...',
    'The door swings wide open!'
  ]
  const [revealIndex, setRevealIndex] = useState(0)

  const current = tasks[door]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const success = await evaluatePrompt(current, input)
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
    setTimeLeft(BASE_TIME)
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setScoreState(s => Math.max(0, s - 20))
          setMessage('Too slow! The door remains locked.')
          setInput('')
          setHintVisible(false)
          return BASE_TIME
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
        <p style={{ marginTop: '1rem' }}>
          <Link to="/leaderboard">Return to Progress</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="escape-page">
      <div className="escape-wrapper">
        <aside className="escape-sidebar">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80"
            alt="Mysterious door"
            className="escape-img"
          />
          <h3>Why Clarity Matters</h3>
          <p>Vague inputs lock AI in confusion loops; precise prompts open doors.</p>
          <blockquote className="sidebar-quote">Why Card: Why Clarity Matters</blockquote>
          <p className="sidebar-tip">Shows how specificity opens doors—literally. Teaching players to apply intent, tone, and task format.</p>
        </aside>
        <div className="room">
          <div className="room-grid">
            <div className="room-main">
          <InstructionBanner>
            <p>Enter a precise prompt to unlock each door.</p>
            <ol>
              <li>Read the hint for clues.</li>
              <li>Rewrite it clearly so the AI understands.</li>
            </ol>
            <p>Example: "Condense this paragraph into three bullet points."</p>
            <p>You can submit up to 100 characters per attempt.</p>
          </InstructionBanner>
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


          <form onSubmit={handleSubmit} className="prompt-form">
            <label htmlFor="prompt-input">Your prompt</label>
            <input
              id="prompt-input"
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 100))}
              placeholder="e.g., 'Rewrite in a formal tone'"
            />
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" onClick={showHint} className="btn-primary">Hint</button>
          </form>
          <ProgressBar percent={openPercent} />
          {hintVisible && (
            <p className="hint-keywords">Hint: {current.checkPrompt}</p>
          )}
          {message && <p className="feedback">{message}</p>}
          <p className="score">Score: {score}</p>
            </div>
            <div className="door-area">
              <DoorAnimation openPercent={openPercent} />
            </div>
          </div>
        </div>
        <ProgressSidebar />
        <div className="next-area" />
      </div>
    </div>
  )
}


