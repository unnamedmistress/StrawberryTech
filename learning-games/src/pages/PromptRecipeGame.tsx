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
  }

  useEffect(() => {
    startRound()
  }, [])

  useEffect(() => {
    if (Object.values(dropped).every(Boolean)) {
      const { score: gained, perfect } = evaluateRecipe(dropped, roundCards)
      setScoreState(s => s + gained)
      if (perfect) {
        setPerfectRounds(p => p + 1)
        if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
          addBadge('prompt-chef')
        }
      }
      setScore('recipe', score + gained)
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
    setDropped(prev => ({ ...prev, [slot]: card.text }))
    setCards(cs => cs.filter(c => c.text !== card.text))
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
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

  const promptText = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`

  return (
    <div className="recipe-page">
      <InstructionBanner>
        Drag each ingredient card into the correct bowl to build the prompt recipe.
      </InstructionBanner>
      <div className="recipe-wrapper">
        <ProgressSidebar />
        <div className="recipe-game">
          <div className="bowls">
            {(['Action','Context','Format','Constraints'] as Slot[]).map(slot => (
              <div
                key={slot}
                className="bowl"
                onDrop={e => handleDrop(slot, e)}
                onDragOver={handleDragOver}
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
          {showPrompt && (
            <div className="plate">
              <h3>Your Prompt</h3>
              <p>{promptText}</p>
              <button onClick={nextRound}>Next Recipe</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
