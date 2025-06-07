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

export type Slot =
  | 'Action'
  | 'Context'
  | 'Format'
  | 'Constraints'
  | 'Audience'
  | 'Setting'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Card {
  type: Slot
  text: string
}

export type Dropped = Record<Slot, string | null>

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

const AUDIENCES = [
  'for beginners',
  'for executives',
  'for teenagers',
  'for engineers',
]

const SETTINGS = [
  'in a fantasy world',
  'in outer space',
  'in a dystopian future',
  'during medieval times',
]

const SLOT_SETS: Record<Difficulty, Slot[]> = {
  easy: ['Action', 'Context', 'Format', 'Constraints'],
  medium: ['Action', 'Context', 'Format', 'Constraints', 'Audience'],
  hard: ['Action', 'Context', 'Format', 'Constraints', 'Audience', 'Setting'],
}

const DEFAULTS: Record<Slot, string[]> = {
  Action: ACTIONS,
  Context: CONTEXTS,
  Format: FORMATS,
  Constraints: CONSTRAINTS,
  Audience: AUDIENCES,
  Setting: SETTINGS,
}

export function parseCardLines(text: string): string[] {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/^[-*\d.\s]+/, '')
    const m = /^(Action|Context|Format|Constraints|Audience|Setting)[:\-\s]+(.+)/i.exec(line)
    if (m) {
      result.push(m[2].trim())
      continue
    }
    if (/^(Action|Context|Format|Constraints|Audience|Setting)$/i.test(line)) {
      if (i + 1 < lines.length) {
        result.push(lines[i + 1].replace(/^[-*\d.\s]+/, ''))
        i++
        continue
      }
    }
    result.push(line)
  }
  return result
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function generateCards(slots: Slot[]): Promise<Card[]> {
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
            content: `Return ${slots.length} short phrases for ${slots.join(', ')} in that order, each on its own line.`,
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
      const lines = parseCardLines(text)
      if (lines.length >= slots.length) {
        return slots.map((s, i) => ({ type: s, text: lines[i] }))
      }
    }
  } catch (err) {
    console.error(err)
    toast.error('Unable to fetch new cards. Using defaults.')
  }
  return slots.map(s => ({ type: s, text: randomItem(DEFAULTS[s]) }))
}

export default function PromptRecipeGame() {
  const TOTAL_TIME = 30

  const { setScore, addBadge, user } = useContext(UserContext)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const slots = SLOT_SETS[difficulty]

  const createDropped = () => {
    const obj = {} as Dropped
    slots.forEach(s => {
      obj[s] = null
    })
    return obj
  }

  const [cards, setCards] = useState<Card[]>([])
  const [roundCards, setRoundCards] = useState<Card[]>([])
  const [dropped, setDropped] = useState<Dropped>(createDropped)
  const [score, setScoreState] = useState(0)
  const [perfectRounds, setPerfectRounds] = useState(0)
  const [combo, setCombo] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const [hoverSlot, setHoverSlot] = useState<Slot | null>(null)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [hintSlot, setHintSlot] = useState<Slot | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [feedback, setFeedback] = useState<Record<Slot, 'correct' | 'wrong' | null>>(() => {
    const obj = {} as Record<Slot, 'correct' | 'wrong' | null>
    slots.forEach(s => {
      obj[s] = null
    })
    return obj
  })
  const [example, setExample] = useState<string | null>(null)

  async function startRound() {
    const newCards = await generateCards(slots)
    setRoundCards(newCards)
    setCards(shuffle([...newCards]))
    setDropped(createDropped())
    setShowPrompt(false)
    setExample(null)
    setTimeLeft(TOTAL_TIME)
    setSelectedCard(null)
    setHintSlot(null)
    setFeedback(createDropped() as Record<Slot, 'correct' | 'wrong' | null>)
    setCombo(0)
  }

  useEffect(() => {
    startRound()
  }, [])

  useEffect(() => {
    startRound()
  }, [difficulty])

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
      const text = slots.map(s => dropped[s] ?? '').join(' ').trim()
      if (text) generateExampleOutput(text)
    }
  }, [showPrompt])

  useEffect(() => {
    if (Object.values(dropped).every(Boolean)) {
      const { score: gained, perfect } = evaluateRecipe(dropped, roundCards)
      let finalScore = gained + Math.floor(timeLeft / 5)
      if (perfect) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
        setPerfectRounds(p => p + 1)
        setCombo(c => c + 1)
        const multiplier = 1 + (combo + 1) * 0.5
        finalScore = Math.round(finalScore * multiplier)
        toast.success(`Combo x${combo + 1}!`)
        if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
          addBadge('prompt-chef')
        }
      } else {
        setCombo(0)
      }
      setScoreState(s => s + finalScore)
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
    setDropped(createDropped())
    setFeedback(createDropped() as Record<Slot, 'correct' | 'wrong' | null>)
    setHintSlot(null)
    setCombo(0)
  }

  function showHint() {
    const remaining = roundCards.filter(c => !Object.values(dropped).includes(c.text))
    if (remaining.length === 0) return
    const card = remaining[Math.floor(Math.random() * remaining.length)]
    if (perfectRounds >= 3) {
      fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'Provide a short cryptic hint for the following phrase',
            },
            { role: 'user', content: card.text },
          ],
          max_tokens: 20,
          temperature: 0.8,
        }),
      })
        .then(res => res.json())
        .then(data => {
          const t: string | undefined = data?.choices?.[0]?.message?.content
          if (t) toast(t.trim())
          else setHintSlot(card.type)
        })
        .catch(() => setHintSlot(card.type))
    } else {
      setHintSlot(card.type)
    }
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

  function sharePrompt() {
    const text = `I scored ${score} in Prompt Recipe Builder! Prompt: ${promptText}`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success('Share text copied'))
    }
  }

  const promptText = slots.map(s => dropped[s] ?? '').join(' ')

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
            {combo > 0 && <span className="combo">Combo x{combo + 1}</span>}
          </div>
          <div className="difficulty-select">
            <label>
              Difficulty
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <ProgressBar percent={(timeLeft / TOTAL_TIME) * 100} />
          <div className="bowls">
            {slots.map(slot => (
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

                  onDragStart={(e: MouseEvent | TouchEvent | PointerEvent) =>
                    handleDragStart(
                      e as unknown as React.DragEvent<HTMLDivElement>,
                      card,
                    )
                  }


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
              <button className="btn-primary copy-btn" onClick={sharePrompt}>
                Share
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
