import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'

import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import Tooltip from '../components/ui/Tooltip'
import ProgressBar from '../components/ui/ProgressBar'
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

async function generateCards(): Promise<Card[]> {
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
              'Return four short phrases for Action, Context, Format and Constraint in that order, each on its own line.',
          },
          { role: 'user', content: 'Provide the phrases.' },
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    })
    const data = await resp.json()
    const text: string | undefined = data?.choices?.[0]?.message?.content
    if (text) {
      const lines = text
        .split('\n')
        .map((l: string) => l.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
      if (lines.length >= 4) {
        return [
          { type: 'Action', text: lines[0] },
          { type: 'Context', text: lines[1] },
          { type: 'Format', text: lines[2] },
          { type: 'Constraints', text: lines[3] },
        ]
      }
    }
  } catch (err) {
    console.error(err)
    toast.error('Unable to fetch new cards. Using defaults.')
  }
  return [
    { type: 'Action', text: randomItem(ACTIONS) },
    { type: 'Context', text: randomItem(CONTEXTS) },
    { type: 'Format', text: randomItem(FORMATS) },
    { type: 'Constraints', text: randomItem(CONSTRAINTS) },
  ]
}

export default function PromptRecipeGame() {
  const TOTAL_TIME = 30

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
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [hintSlot, setHintSlot] = useState<Slot | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [feedback, setFeedback] = useState<Record<Slot, 'correct' | 'wrong' | null>>({
    Action: null,
    Context: null,
    Format: null,
    Constraints: null,
  })
  const [example, setExample] = useState<string | null>(null)

  async function startRound() {
    const newCards = await generateCards()
    setRoundCards(newCards)
    setCards(shuffle([...newCards]))
    setDropped({ Action: null, Context: null, Format: null, Constraints: null })
    setShowPrompt(false)
    setExample(null)
    setTimeLeft(TOTAL_TIME)
    setSelectedCard(null)
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
    if (showPrompt) {
      const text = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`.trim()
      if (text) generateExampleOutput(text)
    }
  }, [showPrompt])

  useEffect(() => {
    if (Object.values(dropped).every(Boolean)) {
      const { score: gained, perfect } = evaluateRecipe(dropped, roundCards)
      const finalScore = gained + Math.floor(timeLeft / 5)
      setScoreState(s => s + finalScore)
      if (perfect) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
        setPerfectRounds(p => p + 1)
        if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
          addBadge('prompt-chef')
        }
      }
      setScore('recipe', score + finalScore)
      setShowPrompt(true)
    }
  }, [dropped])

  function dropSelected(slot: Slot) {
    if (!selectedCard) return
    const correctText = roundCards.find(c => c.type === slot)?.text
    const correct = selectedCard.text === correctText
    setDropped(prev => ({ ...prev, [slot]: selectedCard.text }))
    if (correct) {
      setCards(cs => cs.filter(c => c.text !== selectedCard.text))
    }
    setFeedback(f => ({ ...f, [slot]: correct ? 'correct' : 'wrong' }))
    setSelectedCard(null)
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, card: Card) {
    e.dataTransfer.setData('application/json', JSON.stringify(card))
    setSelectedCard(card)
  }

  function handleDrop(slot: Slot, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data) return
    const card = JSON.parse(data) as Card
    setSelectedCard(card)
    dropSelected(slot)
    setHoverSlot(null)
  }

  function handleDragOver(slot: Slot, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setHoverSlot(slot)
  }

  function handleDragLeave() {
    setHoverSlot(null)
  }

  function handleCardKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    card: Card,
  ) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedCard(card)
    }
  }

  function handleBowlKeyDown(slot: Slot, e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.key === 'Enter' || e.key === ' ') && selectedCard) {
      e.preventDefault()
      dropSelected(slot)
    }
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

  async function generateExampleOutput(prompt: string) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 60,
        }),
      })
      const data = await resp.json()
      const text: string | undefined = data?.choices?.[0]?.message?.content
      if (text) setExample(text.trim())
    } catch (err) {
      console.error(err)
      toast.error('Unable to fetch example output.')
    }
  }

  function copyPrompt() {
    navigator.clipboard.writeText(promptText).then(() => {
      toast.success('Prompt copied!')
    })
  }

  const promptText = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`

  return (
    <div className="recipe-page">
      <InstructionBanner>
        Drag each ingredient card into the correct bowl to build the prompt recipe.
        You can also press Enter on a card then Enter on a bowl to place it.
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
          <ProgressBar percent={(timeLeft / TOTAL_TIME) * 100} />
          <div className="bowls">
            {(['Action', 'Context', 'Format', 'Constraints'] as Slot[]).map(slot => (
              <div
                key={slot}
                className={`bowl${hoverSlot === slot ? ' hover' : ''}${hintSlot === slot ? ' hint' : ''}${feedback[slot] === 'correct' ? ' correct' : ''}${feedback[slot] === 'wrong' ? ' wrong' : ''}`}
                onDrop={e => handleDrop(slot, e)}
                onDragOver={e => handleDragOver(slot, e)}
                onDragLeave={handleDragLeave}
                tabIndex={0}
                role="button"
                onKeyDown={e => handleBowlKeyDown(slot, e)}
              >
                <strong>{slot}</strong>
                <div className="bowl-content">{dropped[slot] || 'Drop here'}</div>
              </div>
            ))}
          </div>
          <div className="cards">
            {cards.map(card => (
              <Tooltip key={card.text} message={`Add the ${card.type.toLowerCase()}` }>
                <motion.div
                  className={`card${selectedCard?.text === card.text ? ' selected' : ''}`}
                  draggable
                  tabIndex={0}
                  role="button"
                  onDragStartCapture={e => handleDragStart(e, card)}
                  onKeyDown={e => handleCardKeyDown(e, card)}
                >
                  {card.text}
                </motion.div>
              </Tooltip>
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
              {example && <p className="sample-output">{example}</p>}
              <img
                className="prompt-image"
                src="https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=400&q=60"
                alt="prompt context"
              />
              <button className="btn-primary copy-btn" onClick={copyPrompt}>
                Copy Prompt
              </button>
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
