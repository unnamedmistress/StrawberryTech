import { useState, useEffect, useContext, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CompletionModal from '../components/ui/CompletionModal'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { notify } from '../shared/notify'

import ProgressSidebar from '../components/layout/ProgressSidebar'
import WhyCard from '../components/layout/WhyCard'
import InstructionBanner from '../components/ui/InstructionBanner'
import Tooltip from '../components/ui/Tooltip'
import TimerBar from '../components/ui/TimerBar'
import { UserContext } from '../shared/UserContext'
import { getTimeLimit } from '../utils/time'
import './PromptRecipeGame.css'
import {
  type Slot,
  type Card,
  type Dropped,
  evaluateRecipe,
  generateCards,
} from './promptRecipeHelpers'


export default function PromptRecipeGame() {
  const { setPoints, addBadge, user, ageGroup } = useContext(UserContext)
  const navigate = useNavigate()
  const TOTAL_ROUNDS = 5
  const TOTAL_TIME = getTimeLimit(user, {
    easy: 45,
    medium: 30,
    hard: 20,
  })
  const SCORE_MULT =
    user.difficulty === 'easy' ? 1 : user.difficulty === 'hard' ? 2 : 1.5
  const [cards, setCards] = useState<Card[]>([])
  const [roundCards, setRoundCards] = useState<Card[]>([])
  const [dropped, setDropped] = useState<Dropped>({
    Action: null,
    Context: null,
    Format: null,
    Constraints: null,
  })
  const [points, setPointsState] = useState(0)
  const [perfectRounds, setPerfectRounds] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hoverSlot, setHoverSlot] = useState<Slot | null>(null)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [hintSlot, setHintSlot] = useState<Slot | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [round, setRound] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<Record<Slot, 'correct' | 'wrong' | null>>({
    Action: null,
    Context: null,
    Format: null,
    Constraints: null,
  })
  const [example, setExample] = useState<string | null>(null)

  const startRound = useCallback(async () => {
    const newCards = await generateCards(ageGroup)
    setRoundCards(newCards)
    setCards(shuffle([...newCards]))
    setDropped({ Action: null, Context: null, Format: null, Constraints: null })
    setShowPrompt(false)
    setSubmitted(false)
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
  }, [TOTAL_TIME, ageGroup])

  useEffect(() => {
    startRound()
  }, [round, startRound])

  useEffect(() => {
    setRound(0)
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
  }, [
    showPrompt,
    dropped.Action,
    dropped.Context,
    dropped.Format,
    dropped.Constraints,
  ])


  function dropSelected(slot: Slot) {
    if (!selectedCard) return
    if (selectedCard.type !== slot) {
      notify('Try a different category.')
      setSelectedCard(null)
      return
    }
    setDropped(prev => ({ ...prev, [slot]: selectedCard.text }))
    setCards(cs => cs.filter(c => c.text !== selectedCard.text))
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
    if (round + 1 < TOTAL_ROUNDS) {
      setRound(r => r + 1)
    } else {
      setFinished(true)
      setPoints('recipe', points)
    }
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
    setSubmitted(false)
  }

  function showHint() {
    const remaining = roundCards.filter(c => !Object.values(dropped).includes(c.text))
    if (remaining.length === 0) return
    const card = remaining[Math.floor(Math.random() * remaining.length)]
    setHintSlot(card.type)
    setPointsState(s => Math.max(0, s - 1))
  }

  function checkAnswer() {
    const { score: gained, perfect } = evaluateRecipe(dropped, roundCards)
    const baseScore = gained + Math.floor(timeLeft / 5)
    const finalScore = Math.round(baseScore * SCORE_MULT)

    setFeedback({
      Action:
        dropped.Action ===
        roundCards.find(c => c.type === 'Action')?.text
          ? 'correct'
          : 'wrong',
      Context:
        dropped.Context ===
        roundCards.find(c => c.type === 'Context')?.text
          ? 'correct'
          : 'wrong',
      Format:
        dropped.Format ===
        roundCards.find(c => c.type === 'Format')?.text
          ? 'correct'
          : 'wrong',
      Constraints:
        dropped.Constraints ===
        roundCards.find(c => c.type === 'Constraints')?.text
          ? 'correct'
          : 'wrong',
    })

    setPointsState(s => s + finalScore)
    if (perfect) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
      setPerfectRounds(p => p + 1)
      if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
        addBadge('prompt-chef')
      }
    }
    notify(`+${finalScore} points`)
    setSubmitted(true)
    setShowPrompt(true)
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
          messages: [
            { role: 'system', content: `Reply in one short sentence for a ${ageGroup} player.` },
            { role: 'user', content: prompt },
          ],
          max_tokens: 60,
        }),
      })
      const data = await resp.json()
      const text: string | undefined = data?.choices?.[0]?.message?.content
      if (text) setExample(text.trim())
    } catch (err) {
      console.error(err)
      notify('Unable to fetch example output.')
    }
  }

  function copyPrompt() {
    navigator.clipboard.writeText(promptText).then(() => {
      notify('Prompt copied!')
    })
  }

  if (finished) {
    return (
      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
        buttonHref="/games/darts"
        buttonLabel="Play Prompt Darts"
      >
        <h3>You finished Prompt Builder!</h3>
        <p className="final-score">Your points: {points}</p>
      </CompletionModal>
    )
  }

  const promptText = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`
  const allFilled = Object.values(dropped).every(Boolean)

  return (
    <div id="main-content" className="recipe-page">
      <InstructionBanner>
        Drag each card to the category it best fits to build a clear AI prompt.
      </InstructionBanner>
      <div className="recipe-wrapper">
        <WhyCard
          className="recipe-sidebar"
          title="Why Build Prompts?"
          explanation="Combining action, context, format and constraints clarifies intent."
          quote="Why Card: This page has potential but needs some polish to make it intuitive, clean, and engaging."
          tip="Arrange each ingredient to craft a clear request."
        />
        <div className="recipe-game">
          <div className="status-bar">
            <span className="round-info">Round {round + 1} / {TOTAL_ROUNDS}</span>
            <span className="score">Points: {points}</span>
            <span className="timer">Time: {timeLeft}s</span>
          </div>
          <TimerBar timeLeft={timeLeft} TOTAL_TIME={TOTAL_TIME} />
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
            <button
              className="btn-primary"
              onClick={checkAnswer}
              disabled={!allFilled || submitted}
            >
              Check Answer
            </button>
            <button className="btn-primary" onClick={clearRound}>Reset</button>
          </div>
          {showPrompt && (
            <div className="plate">
              <h3>Your Prompt</h3>
              <p>{promptText}</p>
              {example && <p className="sample-output">{example}</p>}
              <img
                className="prompt-image"
                src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
                alt="Prompt recipe builder strawberry chef tossing cards labeled Action, Context, Format, Constraints."
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
        <div className="next-area">
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/games/darts')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/games/darts">Skip to Prompt Darts</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
