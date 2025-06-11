
import { useState, useEffect, useRef, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { scorePrompt } from '../../utils/scorePrompt'

import InstructionBanner from '../../components/ui/InstructionBanner'
import ProgressSidebar from '../../components/layout/ProgressSidebar'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import JsonLd from '../../components/seo/JsonLd'
import styles from '../../styles/ComposeTweetGame.module.css'
import CompletionModal from '../../components/ui/CompletionModal'

const SAMPLE_RESPONSE =
  'Just finished reading an amazing book on technology! Highly recommend it to everyone. #BookLovers'
const CORRECT_PROMPT = 'Compose a tweet about reading a new book'
const SCORE_THRESHOLD = 20

const PROMPT_TIPS = [
  'Be specific about what you want the AI to do.',
  'Provide context so the AI understands your request.',
  'Break complex tasks into clear steps.',
  'State the desired length or format.',
  'Offer examples to show the style you expect.',

]

interface PromptPair {
  prompt: string
  response: string
}

const pairs: PromptPair[] = [
  { prompt: CORRECT_PROMPT, response: SAMPLE_RESPONSE },
]

export default function ComposeTweetGame() {
  const { setPoints, addBadge, user } = useContext(UserContext) as UserContextType
  const router = useRouter()
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [doorUnlocked, setDoorUnlocked] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  const [round, setRound] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const [finished, setFinished] = useState(false)

  const [points, setPointsState] = useState<number | null>(null)

  const timerRef = useRef<number | null>(null)
  const pair = pairs[round]

  useEffect(() => {
    setTimeLeft(30)
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setFeedback('Too slow! The door remains locked.')
          setShowNext(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [round])

  useEffect(() => {
    if (!doorUnlocked) return
    const id = setInterval(() => {
      setTipIndex(i => (i + 1) % PROMPT_TIPS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [doorUnlocked])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { score: guessScore, tips } = scorePrompt(CORRECT_PROMPT, guess)
    if (guessScore >= SCORE_THRESHOLD) {
      setFeedback('Correct! The door is unlocked.')
      setDoorUnlocked(true)
      const earned = guessScore + timeLeft
      setPointsState(earned)
      clearInterval(timerRef.current!)
      setPoints('compose', earned)
      if (timeLeft >= 20 && !user.badges.includes('speedy-composer')) {
        addBadge('speedy-composer')
      }
      setShowNext(true)
      if (round + 1 >= pairs.length) {
        setFinished(true)
      }
    } else {
      setFeedback(tips.join(' '))
    }
    setGuess('')
  }

  function handleHint() {
    const words = pair.prompt.split(' ')
    setFeedback(`Hint: The prompt is about ${words[2]}...`)
  }

  function nextRound() {
    if (round + 1 < pairs.length) {
      clearInterval(timerRef.current!)
      setRound(r => r + 1)
      setGuess('')
      setFeedback('')
      setDoorUnlocked(false)
      setShowNext(false)
    }
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Compose Tweet Game',
          description: 'Guess the hidden tweet prompt to unlock the door.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_16_34%20PM.png',
        }}
      />
      <div className="compose-page clearfix">
      <InstructionBanner>Guess the Prompt</InstructionBanner>
      <div className={styles['compose-wrapper']}>
        <aside className={styles['compose-sidebar']}>
          <p className={styles.timer}>Time left: {timeLeft}s</p>
        </aside>
        <div className={styles['compose-game']}>
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_16_34%20PM.png"
            alt="Earlier prompt recipe builder with similar strawberry chef and cards."
            className="game-card-image"
          />
          <div className={styles['ai-box']} aria-live="polite">
            {pair.response}
          </div>
          <form onSubmit={handleSubmit} className={styles['prompt-form']}>
            <label htmlFor="prompt-input">Your guess</label>
            <input
              id="prompt-input"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Guess the prompt..."
              aria-label="Input your guess for the prompt"
            />
            <button type="submit" className="btn-primary" aria-label="Submit your guess">
              Submit
            </button>
            <button
              type="button"
              onClick={handleHint}
              className="btn-primary"
              aria-label="Get a hint"
            >
              Hint
            </button>
          </form>
          {feedback && <p className={styles.feedback}>{feedback}</p>}
          {points !== null && (
            <p className={styles['final-score']} aria-live="polite">
              Your points: {points}
            </p>
          )}
          <div className={styles['door-area']}>
            <img
              src={doorUnlocked ? '/images/door-open.png' : '/images/door-closed.png'}
              alt={doorUnlocked ? 'Door unlocked' : 'Door locked'}
              width={100}
              height={150}
            />
            {doorUnlocked && (
              <img
                src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png"
                alt="Another version of strawberry calling out sick, same description."
                className="hero-img"
                style={{ width: '200px' }}
              />
            )}
            {doorUnlocked && (
              <p className={styles['prompt-tip']} role="status" aria-live="polite">
                {PROMPT_TIPS[tipIndex]}
              </p>
            )}
          </div>
          {showNext && round + 1 < pairs.length && (
            <button className="btn-primary" onClick={nextRound}>
              Next Prompt
            </button>
          )}
        </div>
        <ProgressSidebar />
        <div className={styles['next-area']}>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>            <button
              className="btn-primary"
              onClick={() => router.push('/community')}
            >
              Next
            </button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link href="/community">Return to Progress</Link>
          </p>
        </div>
      </div>
    </div>
    {finished && (      <CompletionModal
        imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png"
        buttonHref="/community"
        buttonLabel="View Community"
      >
        <h3>All prompts complete!</h3>
        {points !== null && (
          <p className={styles['final-score']} aria-live="polite">Your points: {points}</p>
        )}
      </CompletionModal>
    )}
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Compose Tweet Game | StrawberryTech</title>
      <meta
        name="description"
        content="Guess the hidden tweet prompt to unlock the door."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/compose" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
