import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import JsonLd from '../../components/seo/JsonLd'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import styles from '../../styles/IntroGame.module.css'

interface Round {
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

const ROUNDS: Round[] = [
  {
    prompt: 'AI is basically an algorithm that predicts the next ___',
    options: ['picture', 'word', 'dance'],
    answer: 'word',
    explanation: 'Large language models guess the most likely next word.'
  },
  {
    prompt: 'It learned by reading huge parts of the ___',
    options: ['ocean', 'dictionary', 'internet'],
    answer: 'internet',
    explanation: 'Training data comes from text all over the internet.'
  },
  {
    prompt: 'When you chat with AI you give it a ___',
    options: ['question', 'banana', 'rocket'],
    answer: 'question',
    explanation: 'A prompt is your question or instruction.'
  }
]

export default function IntroGame() {
  const router = useRouter()
  const { setPoints } = useContext(UserContext) as UserContextType
  const [round, setRound] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const current = ROUNDS[round]

  function handleSelect(option: string) {
    setChoice(option)
    if (option === current.answer) {
      setScore(s => s + 10)
    }
  }

  function next() {
    if (round + 1 < ROUNDS.length) {
      setRound(r => r + 1)
      setChoice(null)
    } else {
      setPoints('intro', score)
      router.push('/games/tone')
    }
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'AI Basics',
          description: 'Learn how AI predicts the next word.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png'
        }}
      />
      <ModernGameLayout
        gameTitle="AI Basics"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        showProgressSidebar
        whyCard={
          <WhyCard
            title="What is AI?"
            explanation="Think of it as a brain of the internet that predicts the next word." />
        }
        nextGameButton={
          <button className="btn-primary" onClick={() => router.push('/games/tone')}>
            Next: Tone Game →
          </button>
        }
      >
        <div className={styles.introGame}>
          <p className={styles.prompt}>{current.prompt}</p>
          <div className={styles.options}>
            {current.options.map(option => (
              <button
                key={option}
                className="btn-primary"
                disabled={!!choice}
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {choice && (
            <div className={styles.feedback}>
              {choice === current.answer ? 'Correct!' : 'Nice try!'} {current.explanation}
            </div>
          )}
          {choice && (
            <button className="btn-primary" onClick={next}>
              {round + 1 < ROUNDS.length ? 'Next Question' : 'Finish'}
            </button>
          )}
        </div>
      </ModernGameLayout>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>AI Basics | StrawberryTech</title>
      <meta name="description" content="Learn how AI predicts the next word." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/intro" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
