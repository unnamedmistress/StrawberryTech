import { useState, useEffect, useContext } from 'react'

import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import { UserContext } from '../context/UserContext'
import './PromptRecipeGame.css'

export type Slot = 'Action' | 'Context' | 'Format' | 'Constraints'

export interface Card {
  type: Slot
  text: string
}

export interface Dropped {
  Action: string | null
  Context: string | null
  Format: string | null
  Constraints: string | null
}

export function evaluateRecipe(dropped: Dropped, cards: Card[]) {
  let score = 0
  let perfect = true
  for (const card of cards) {
    if (dropped[card.type] === card.text) {
      score += 1
    } else {
      perfect = false
    }
  }
  return { score, perfect }
}

const ACTIONS = [
  'Write a short poem',
  'Draft an email',
  'Summarize the text',
  'Explain the concept',
]
const CONTEXTS = [
  'about renewable energy',
  'for a job interview',
  'for kids',
  'with comedic tone',
]
const FORMATS = [
  'as bullet points',
  'in a single paragraph',
  'in rhyme',
  'as a numbered list',
]
const CONSTRAINTS = [
  'under 50 words',
  'using simple language',
  'avoid technical terms',
  'no more than 3 sentences',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function PromptRecipeGame() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const [cards, setCards] = useState<Card[]>([])
  const [roundCards, setRoundCards] = useState<Card[]>([])
  const [dropped, setDropped] = useState<Dropped>({
    Action: null,
    Context: null,
    Format: null,
    Constraints: null,
  })
  const [score, setScoreState] = useState(0)
  const [perfectRounds, setPerfectRounds] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const [hoverSlot, setHoverSlot] = useState<Slot | null>(null)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [hintSlot, setHintSlot] = useState<Slot | null>(null)
  const [feedback, setFeedback] = useState<Record<Slot, 'correct' | 'wrong' | null>>({
    Action: null,
    Context: null,
    Format: null,
    Constraints: null,
  })

  function startRound() {
    const newCards: Card[] = [
      { type: 'Action', text: randomItem(ACTIONS) },
      { type: 'Context', text: randomItem(CONTEXTS) },
      { type: 'Format', text: randomItem(FORMATS) },
      { type: 'Constraints', text: randomItem(CONSTRAINTS) },
    ]
    setRoundCards(newCards)
    setCards(shuffle([...newCards]))
    setDropped({ Action: null, Context: null, Format: null, Constraints: null })
    setShowPrompt(false)
    setTimeLeft(30)
    setHintSlot(null)
    setFeedback({
      Action: null,
      Context: null,
      Format: null,
      Constraints: null,
    })
  }

  useEffect(() => {
    startRound()
  }, [])

  useEffect(() => {
    if (showPrompt) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          setShowPrompt(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [showPrompt])

  useEffect(() => {
    if (Object.values(dropped).every(Boolean)) {
      const { score: gained, perfect } = evaluateRecipe(dropped, roundCards)
      const finalScore = gained + Math.floor(timeLeft / 5)
      setScoreState(s => s + finalScore)
      if (perfect) {
        setPerfectRounds(p => p + 1)
        if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
          addBadge('prompt-chef')
        }
      }
      setScore('recipe', score + finalScore)
      setShowPrompt(true)
    }
  }, [dropped])

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, card: Card) {
    e.dataTransfer.setData('application/json', JSON.stringify(card))
  }

  function handleDrop(slot: Slot, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data) return
    const card = JSON.parse(data) as Card
    const correctText = roundCards.find(c => c.type === slot)?.text
    const correct = card.text === correctText
    setDropped(prev => ({ ...prev, [slot]: card.text }))
    if (correct) {
      setCards(cs => cs.filter(c => c.text !== card.text))
    }
    setFeedback(f => ({ ...f, [slot]: correct ? 'correct' : 'wrong' }))
    setHoverSlot(null)
  }

  function handleDragOver(slot: Slot, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setHoverSlot(slot)
  }

  function handleDragLeave() {
    setHoverSlot(null)
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function nextRound() {
    setLevel(l => l + 1)
    startRound()
  }

  function clearRound() {
    setCards(shuffle([...roundCards]))
    setDropped({ Action: null, Context: null, Format: null, Constraints: null })
    setFeedback({
      Action: null,
      Context: null,
      Format: null,
      Constraints: null,
    })
    setHintSlot(null)
  }

  function showHint() {
    const remaining = roundCards.filter(c => !Object.values(dropped).includes(c.text))
    if (remaining.length === 0) return
    const card = remaining[Math.floor(Math.random() * remaining.length)]
    setHintSlot(card.type)
    setScoreState(s => Math.max(0, s - 1))
  }

  const promptText = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`

  return (
    <div className="recipe-page">
      <InstructionBanner>
        Drag each ingredient card into the correct bowl to build the prompt recipe.
      </InstructionBanner>
      <div className="recipe-wrapper">
        <aside className="recipe-sidebar">
          <h3>Why Build Prompts?</h3>
          <p>Combining action, context, format and constraints clarifies intent.</p>
          <blockquote className="sidebar-quote">Why Card: This page has potential but needs some polish to make it intuitive, clean, and engaging.</blockquote>
          <p className="sidebar-tip">Arrange each ingredient to craft a clear request.</p>
        </aside>
        <div className="recipe-game">
          <div className="status-bar">
            <span className="score">Score: {score}</span>
            <span className="timer">Time: {timeLeft}s</span>
          </div>
          <div className="bowls">
            {(['Action', 'Context', 'Format', 'Constraints'] as Slot[]).map(slot => (
              <div
                key={slot}
                className={`bowl${hoverSlot === slot ? ' hover' : ''}${hintSlot === slot ? ' hint' : ''}${feedback[slot] === 'correct' ? ' correct' : ''}${feedback[slot] === 'wrong' ? ' wrong' : ''}`}
                onDrop={e => handleDrop(slot, e)}
                onDragOver={e => handleDragOver(slot, e)}
                onDragLeave={handleDragLeave}
              >
                <strong>{slot}</strong>
                <div className="bowl-content">{dropped[slot] || 'Drop here'}</div>
              </div>
            ))}
          </div>
          <div className="cards">
            {cards.map(card => (
              <div
                key={card.text}
                className="card"
                draggable
                onDragStart={e => handleDragStart(e, card)}
              >
                {card.text}
              </div>
            ))}
          </div>
          <div className="game-actions">
            <button className="btn-primary" onClick={showHint}>Hint</button>
            <button className="btn-primary" onClick={clearRound}>Clear</button>
          </div>
          {showPrompt && (
            <div className="plate">
              <h3>Your Prompt</h3>
              <p>{promptText}</p>
            </div>
          )}
        </div>
        <ProgressSidebar />
        {showPrompt && (
          <div className="next-area">
            <button className="btn-primary" onClick={nextRound}>Next Recipe</button>
          </div>
        )}
      </div>
    </div>
  )
}
