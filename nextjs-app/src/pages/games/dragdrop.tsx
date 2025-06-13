import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import styles from '../../styles/DragDropGame.module.css'
import JsonLd from '../../components/seo/JsonLd'

const tones = [
  'Polite',
  'Casual',
  'Emotional',
  'Angry',
  'Compelling',
  'Persuasive',
] as const

type Tone = (typeof tones)[number]

const examples: Record<Tone, string> = {
  Polite:
    "Good morning, I'm not feeling well today and won't be able to come in. I wanted to let you know as soon as possible.",
  Casual:
    "Hey, I'm sick and can't make it to work today. Sorry for the short notice.",
  Emotional:
    "I feel terrible about missing work, but I'm really sick and need to stay home. I hope you'll understand.",
  Angry:
    "I won't be in today because I'm sick. I'm frustrated that I'm feeling this way.",
  Compelling:
    "Unfortunately I'm quite sick and need to rest today. I'll keep you updated and make sure everything is covered.",
  Persuasive:
    "Would it be alright if I took today off to recover from this illness? I believe I'll be more productive if I can fully rest.",
}

export default function DragDropGame() {
  const [selected, setSelected] = useState<Tone | null>(null)
  const [used, setUsed] = useState<Set<Tone>>(new Set())
  const [quizAnswer, setQuizAnswer] = useState<Tone | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { user } = useContext(UserContext) as UserContextType
  const router = useRouter()

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, tone: Tone) {
    e.dataTransfer.setData('text/plain', tone)
  }

  function handleDrop(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault()
    const tone = e.dataTransfer.getData('text/plain') as Tone
    if (tones.includes(tone)) {
      setSelected(tone)
      setUsed(new Set(used).add(tone))
      setUserMessage('')
      setSubmitted(false)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault()
  }

  function handleSubmit() {
    if (userMessage.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Drag & Drop Tone Game',
          description: 'Drag adjectives to explore how tone changes a message.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png',
        }}
      />      <div className={styles['dragdrop-page']}>
      <ModernGameLayout
        gameTitle="Drag & Drop Tone"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
        whyCard={
          <WhyCard
            title="Why Tone Matters"
            explanation="The same message can sound completely different depending on the words you choose. In AI prompting, tone controls how the AI responds to you."
            lesson={
              <div>
                <p><strong>Tone in AI prompting affects:</strong></p>
                <ul>
                  <li><strong>Formality:</strong> Professional vs. casual responses</li>
                  <li><strong>Mood:</strong> Enthusiastic vs. neutral delivery</li>
                  <li><strong>Approach:</strong> Direct vs. gentle communication</li>
                  <li><strong>Audience:</strong> Expert vs. beginner explanations</li>
                </ul>
              </div>
            }
            examples={[
              {
                good: "Please explain quantum physics in simple, friendly terms for a curious 12-year-old.",
                bad: "Explain quantum physics."
              }
            ]}
            tip="Experiment with different adjectives to see how they change the feeling of your message. The right tone helps AI give you exactly the style of response you need!"
          />
        }
        nextGameButton={
          <button className="btn-primary" onClick={() => router.push('/games/guess')}>
            Next: Guess the Prompt →
          </button>
        }
      >
      <div className={styles['dragdrop-wrapper']}>
        <div className={`${styles['dragdrop-game']} clearfix`}>
            <h2>Drag a tone into the blank</h2>
            <img
              src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
              alt="Tone game illustration"
              className="game-card-image"
            />
            <p className={`${styles.sentence} game-text`}>
              Write a
              <span
                className={styles['drop-area']}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {selected ? ` ${selected} ` : ' ____ '}
              </span>
              short text to my manager calling out of work sick today.
            </p>            <div className={styles['word-bank']}>
              {tones.map((tone) => (
                <div
                  key={tone}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tone)}
                  className={styles.word}
                  onClick={() => {
                    if (!used.has(tone)) {
                      setSelected(tone)
                      setUsed(new Set(used).add(tone))
                      setUserMessage('')
                      setSubmitted(false)
                    }
                  }}
                  style={{
                    opacity: used.has(tone) ? 0.5 : 1,
                    cursor: used.has(tone) ? 'default' : 'pointer',
                    userSelect: 'none'
                  }}
                >
                  {tone}
                </div>
              ))}
            </div>
            {selected && (
              <div className={styles.response}>
                <h3>AI Response</h3>
                <p>{examples[selected]}</p>
                {!submitted && (
                  <div className={styles['message-input']}>
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={handleSubmit}
                      className="btn-primary"
                      disabled={!userMessage.trim()}
                    >
                      Submit Message
                    </button>
                  </div>
                )}
                {submitted && (
                  <p className="user-message">You wrote: {userMessage}</p>
                )}
              </div>
            )}
            {used.size === tones.length && (
              <div className={styles.quiz}>
                <h3>Quick test</h3>
                <p>
                  What tone should you use when writing a message to your boss
                  that you will be out of work sick today?
                </p>
                <div className={styles.options}>
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      className="btn-primary"
                      onClick={() => setQuizAnswer(tone)}
                      disabled={!!quizAnswer}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
                {quizAnswer && (
                  <p className={styles.feedback}>
                    {quizAnswer === 'Polite'
                      ? 'Correct! A polite tone is best for informing your boss.'
                      : 'Not quite. A polite tone is usually most appropriate.'}
                  </p>
                )}              </div>
            )}
          </div>
        </div>
      </ModernGameLayout>
    </div>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>Drag &amp; Drop Tone Game | StrawberryTech</title>
      <meta
        name="description"
        content="Drag adjectives to explore how tone changes a message."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/dragdrop" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
