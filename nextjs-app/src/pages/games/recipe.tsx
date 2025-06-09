import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import HeadTag from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'
import JsonLd from '../../components/seo/JsonLd'

import ProgressSidebar from '../../components/layout/ProgressSidebar'
import InstructionBanner from '../../components/ui/InstructionBanner'
import Tooltip from '../../components/ui/Tooltip'
import TimerBar from '../../components/ui/TimerBar'
import CompletionModal from '../../components/ui/CompletionModal'
import { UserContext } from '../../context/UserContext'
import { getTimeLimit } from '../../utils/time'
import '../../styles/PromptRecipeGame.css'

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

export function parseCardLines(text: string): string[] {
  const raw = text.split(/\r?\n/).map(l => l.trim())
  const lines: string[] = []
  const labels = ['Action', 'Context', 'Format', 'Constraints']

  for (let i = 0; i < raw.length; i++) {
    let line = raw[i]
    if (!line) continue

    line = line.replace(/^[-*\d.\s]+/, '')

    const labelIndex = labels.findIndex(
      l => line.toLowerCase() === l.toLowerCase(),
    )
    if (labelIndex !== -1) {
      while (++i < raw.length && !raw[i].trim()) {
        /* skip empty */
      }
      if (i < raw.length) {
        let next = raw[i].replace(/^[-*\d.\s]+/, '')
        next = next
          .replace(
            /^(Action|Context|Format|Constraints)[\s:.\-=]+/i,
            '',
          )
          .trim()
        if (next) lines.push(next)
      }
      continue
    }

    line = line
      .replace(
        /^(Action|Context|Format|Constraints)[\s:.\-=]+/i,
        '',
      )
      .trim()
    if (line) lines.push(line)
  }

  return lines
}

const ACTIONS = [
  'Writing a love letter',
  'Crafting a thank-you note',
  'Apologizing to a friend',
  'Congratulating a colleague',
  'Inviting someone to lunch',
]
const CONTEXTS = [
  "for Valentine's Day",
  'after a successful project',
  'on their birthday',
  'before a big exam',
  'for a wedding anniversary',
]
const FORMATS = [
  'handwritten on fancy stationery',
  'as a short text message',
  'in a playful poem',
  'in a formal email',
  'as a social media post',
]
const CONSTRAINTS = [
  'must be under 200 words',
  'include one emoji',
  'avoid mentioning work',
  'use a friendly tone',
  'limit to three sentences',
]

const CATEGORY_POOLS: Record<Slot, string[]> = {
  Action: ACTIONS,
  Context: CONTEXTS,
  Format: FORMATS,
  Constraints: CONSTRAINTS,
}

export function ensureCardSet(lines: string[]): Card[] {
  const categories: Slot[] = ['Action', 'Context', 'Format', 'Constraints']
  return categories.map((cat, idx) => ({
    type: cat,
    text:
      lines[idx] && lines[idx].trim()
        ? lines[idx].trim()
        : randomItem(CATEGORY_POOLS[cat]),
  }))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function generateCards(): Promise<Card[]> {
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Provide four short phrases that clearly fit the labels Action, Context, Format and Constraints. Output exactly four lines in that order and prefix each line with the matching label followed by a colon. Example:\nAction: Write a thank you note\nContext: to a colleague\nFormat: as a short poem\nConstraints: under 50 words.',
          },
          { role: 'user', content: 'Provide the labeled phrases.' },
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    })
    const data = await resp.json()
    const text: string | undefined = data?.choices?.[0]?.message?.content
    if (text) {
      const lines = parseCardLines(text)
      if (lines.length >= 4) {
        return ensureCardSet(lines)
      }
    }
  } catch (err) {
    console.error(err)
    toast.error('Unable to fetch new cards. Using defaults.')
  }
  return ensureCardSet([])
}

export default function PromptRecipeGame() {
  const { setScore, addBadge, user } = useContext(UserContext)
  const router = useRouter()
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
  const [score, setScoreState] = useState(0)
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

  async function startRound() {
    const newCards = await generateCards()
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


  function dropSelected(slot: Slot) {
    if (!selectedCard) return
    if (selectedCard.type !== slot) {
      toast.error('Try a different category.')
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
      startRound()
    } else {
      setFinished(true)
      setScore('recipe', score)
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
    setScoreState(s => Math.max(0, s - 1))
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

    setScoreState(s => s + finalScore)
    if (perfect) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
      setPerfectRounds(p => p + 1)
      if (perfectRounds + 1 >= 10 && !user.badges.includes('prompt-chef')) {
        addBadge('prompt-chef')
      }
    }
    toast.success(`+${finalScore} points`)
    setSubmitted(true)
    setShowPrompt(true)
  }

  async function generateExampleOutput(prompt: string) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
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

  if (finished) {
    return (
      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
        buttonHref="/games/darts"
        buttonLabel="Play Prompt Darts"
      >
        <h3>You finished Prompt Builder!</h3>
        <p className="final-score">Your score: {score}</p>
      </CompletionModal>
    )
  }

  const promptText = `${dropped.Action ?? ''} ${dropped.Context ?? ''} ${dropped.Format ?? ''} ${dropped.Constraints ?? ''}`
  const allFilled = Object.values(dropped).every(Boolean)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Prompt Builder Game',
          description: 'Drag cards to craft the perfect AI prompt.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png',
        }}
      />
      <HeadTag>
        <title>Prompt Recipe Builder - StrawberryTech</title>
        <meta property="og:title" content="Prompt Recipe Builder - StrawberryTech" />
        <meta
          property="og:description"
          content="Drag cards to craft clear prompts and see the AI's response."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
        />
        <meta
          property="og:url"
          content="https://strawberry-tech.vercel.app/games/recipe"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prompt Recipe Builder - StrawberryTech" />
        <meta
          name="twitter:description"
          content="Drag cards to craft clear prompts and see the AI's response."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
        />
          <meta
            name="twitter:url"
            content="https://strawberry-tech.vercel.app/games/recipe"
          />
        </HeadTag>
      <div className="recipe-page">
      <InstructionBanner>
        Drag each card to the category it best fits to build a clear AI prompt.
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
            <span className="round-info">Round {round + 1} / {TOTAL_ROUNDS}</span>
            <span className="score">Score: {score}</span>
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
              onClick={() => router.push('/games/darts')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link href="/games/darts">Skip to Prompt Darts</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Prompt Builder Game | StrawberryTech</title>
      <meta
        name="description"
        content="Drag cards to craft the perfect AI prompt."
      />
      <link rel="canonical" href="https://strawberrytech.com/games/recipe" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
