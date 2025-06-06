import { useState, useEffect, useContext, useRef } from 'react'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import InstructionBanner from '../components/ui/InstructionBanner'
import { UserContext } from '../context/UserContext'
import './PromptRecipeGame.css'

type Part = 'Action' | 'Context' | 'Format' | 'Constraints'

interface PromptParts {
  action: string
  context: string
  format: string
  constraints: string
}

const PROMPTS: PromptParts[] = [
  {
    action: 'Summarize',
    context: 'this press release',
    format: 'as 3 bullets',
    constraints: 'in 50 words',
  },
  {
    action: 'Rewrite',
    context: 'the instructions',
    format: 'as a numbered list',
    constraints: 'under 100 words',
  },
  {
    action: 'Translate',
    context: 'this paragraph',
    format: 'into Spanish',
    constraints: 'preserving tone',
  },
]

export default function PromptRecipeGame() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const [round, setRound] = useState(0)
  const [score, setScoreState] = useState(0)
  const [perfect, setPerfect] = useState(0)
  const [cards, setCards] = useState<{ text: string; part: Part }[]>([])
  const [placed, setPlaced] = useState<Partial<PromptParts>>({})
  const dragged = useRef<{ text: string; part: Part } | null>(null)

  useEffect(() => {
    startRound()
  }, [])

  function startRound() {
    const next = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
    const newCards: { text: string; part: Part }[] = [
      { text: next.action, part: 'Action' },
      { text: next.context, part: 'Context' },
      { text: next.format, part: 'Format' },
      { text: next.constraints, part: 'Constraints' },
    ].sort(() => Math.random() - 0.5)
    setPlaced({})
    setCards(newCards)
  }

  function handleDragStart(card: { text: string; part: Part }) {
    dragged.current = card
  }

  function handleDrop(part: Part) {
    if (dragged.current) {
      setPlaced(prev => ({ ...prev, [part.toLowerCase()]: dragged.current!.text }))
      if (dragged.current.part === part) {
        setScoreState(s => s + 10)
      }
      dragged.current = null
    }
  }

  useEffect(() => {
    if (
      placed.action &&
      placed.context &&
      placed.format &&
      placed.constraints
    ) {
      const correct =
        placed.action === PROMPTS[round].action &&
        placed.context === PROMPTS[round].context &&
        placed.format === PROMPTS[round].format &&
        placed.constraints === PROMPTS[round].constraints
      if (correct) {
        setScoreState(s => s + 30)
        setPerfect(p => p + 1)
      }
      const nextRound = (round + 1) % PROMPTS.length
      setRound(nextRound)
      startRound()
    }
  }, [placed, round])

  useEffect(() => {
    if (perfect >= 10 && !user.badges.includes('prompt-chef')) {
      addBadge('prompt-chef')
    }
    setScore('recipe', score)
  }, [score, perfect, addBadge, setScore, user.badges])

  const assembled =
    placed.action &&
    placed.context &&
    placed.format &&
    placed.constraints
      ? `${placed.action} ${placed.context} ${placed.format} ${placed.constraints}`
      : null

  return (
    <div className="recipe-page">
      <InstructionBanner>
        Drag each card into the correct bowl to build a clear prompt.
      </InstructionBanner>
      <div className="recipe-wrapper">
        <ProgressSidebar />
        <div className="kitchen">
          <div className="cards">
            {cards.map((c) => (
              <div
                key={c.text}
                className="card"
                draggable
                onDragStart={() => handleDragStart(c)}
              >
                {c.text}
              </div>
            ))}
          </div>
          <div className="bowls">
            {(['Action', 'Context', 'Format', 'Constraints'] as Part[]).map((p) => (
              <div
                key={p}
                className="bowl"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(p)}
              >
                <strong>{p}</strong>
                <p>
                  {(placed as Record<string, string>)[p.toLowerCase()] ?? '---'}
                </p>
              </div>
            ))}
          </div>
          {assembled && <div className="plate">{assembled}</div>}
        </div>
      </div>
    </div>
  )
}


