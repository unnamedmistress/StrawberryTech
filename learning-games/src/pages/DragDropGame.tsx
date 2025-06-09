import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import GamePageLayout from '../components/layout/GamePageLayout'
import WhyCard from '../components/layout/WhyCard'
import './DragDropGame.css'

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
    <div className="dragdrop-page">
      <div className="dragdrop-wrapper">
        <GamePageLayout
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
          imageAlt="Tone game illustration"
          infoCardContent={
            <WhyCard
              title="Why Tone Matters"
              explanation="Drag the adjectives into the blank to try different tones. Swap words wisely and watch your message sparkle!"
            />
          }
          instructions="Match adjectives to explore how tone changes the meaning of a message."
          onCTAClick={() => {}}
          ctaText="Start Playing"
        >
          <div className="dragdrop-game clearfix">
            <h2>Drag a tone into the blank</h2>
            <img
              src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png"
              alt="Tone game illustration"
              className="game-card-image"
            />
            <p className="sentence game-text">
              Write a
              <span
                className="drop-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {selected ? ` ${selected} ` : ' ____ '}
              </span>
              short text to my manager calling out of work sick today.
            </p>
            <div className="word-bank">
              {tones.map((tone) => (
                <div
                  key={tone}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tone)}
                  className="word"
                >
                  {tone}
                </div>
              ))}
            </div>
            {selected && (
              <div className="response">
                <h3>AI Response</h3>
                <p>{examples[selected]}</p>
                {!submitted && (
                  <div className="message-input">
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
              <div className="quiz">
                <h3>Quick test</h3>
                <p>
                  What tone should you use when writing a message to your boss
                  that you will be out of work sick today?
                </p>
                <div className="options">
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
                  <p className="feedback">
                    {quizAnswer === 'Polite'
                      ? 'Correct! A polite tone is best for informing your boss.'
                      : 'Not quite. A polite tone is usually most appropriate.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </GamePageLayout>
        <ProgressSidebar />
      </div>
      <div className="next-area">
        <p>
          <Link to="/leaderboard">Return to Progress</Link>
        </p>
      </div>
    </div>
  )
}
