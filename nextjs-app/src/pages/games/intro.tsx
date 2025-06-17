import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import JsonLd from '../../components/seo/JsonLd'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import styles from '../../styles/IntroGame.module.css'

interface StoryPart {
  line: string
  explanation: string
}

const STORY_PARTS: StoryPart[] = [
  {
    line: 'A dusty book glows on the shelf.',
    explanation:
      'I started with a setting because most stories begin by describing where things take place.'
  },
  {
    line: 'Inside, a map points to a hidden door.',
    explanation:
      'After a scene is set, the next logical piece is usually a clue or problem to solve.'
  },
  {
    line: 'The door creaks open revealing a shimmering portal.',
    explanation:
      'Stories often introduce a twist to keep readers engaged. I predicted a portal as a likely surprise.'
  }
]

export default function IntroGame() {
  const router = useRouter()
  const { setPoints } = useContext(UserContext) as UserContextType
  const [step, setStep] = useState(-1)
  const [story, setStory] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [explanation, setExplanation] = useState('')

  function start(scene: string) {
    setStory([`You chose: ${scene}`])
    setExplanation('Great choice! Let\'s see what might happen next.')
    setStep(0)
    setInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step >= STORY_PARTS.length) return
    const userAction = input.trim() || '...'
    setStory(prev => [...prev, `You: ${userAction}`, `AI: ${STORY_PARTS[step].line}`])
    setExplanation(STORY_PARTS[step].explanation)
    setInput('')
    setStep(s => s + 1)
  }

  function finish() {
    setPoints('intro', STORY_PARTS.length * 5)
    router.push('/games/tone')
  }

  const finished = step >= STORY_PARTS.length

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'AI Basics',
          description: 'Learn how AI predicts the next word through a short story.',
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
            explanation="Think of AI as a prediction engine. It guesses the next words based on patterns, like finishing a puzzle." />
        }
        nextGameButton={
          finished && (
            <button className="btn-primary" onClick={finish}>
              Next: Tone Game →
            </button>
          )
        }
      >
        <div className={styles.introGame}>
          {step === -1 && (
            <>
              <p className={styles.prompt}>Choose a starting scene</p>
              <div className={styles.options}>
                <button className="btn-primary" onClick={() => start('a mysterious library')}>Library</button>
                <button className="btn-primary" onClick={() => start('a space station')}>Space Station</button>
                <button className="btn-primary" onClick={() => start('an enchanted forest')}>Enchanted Forest</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); if (input.trim()) start(input.trim()) }} className={styles.inputArea}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Or type your own scene"
                />
                <button type="submit" className="btn-primary">Start</button>
              </form>
            </>
          )}

          {step >= 0 && (
            <>
              <div className={styles.storyText}>
                {story.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {!finished && (
                <form onSubmit={handleSubmit} className={styles.inputArea}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="What do you do next?"
                  />
                  <button type="submit" className="btn-primary">Continue</button>
                </form>
              )}
              {explanation && <p className={styles.explanation}>{explanation}</p>}
            </>
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
