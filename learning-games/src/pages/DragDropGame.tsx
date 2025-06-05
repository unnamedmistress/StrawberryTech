import { useState } from 'react'
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
    "Hey, I'm sorry but something came up and I need to cancel. Hope we can reschedule soon!",
  Casual:
    "Yo, gotta bail on our plans—something popped up. Let's hang later!",
  Emotional:
    "I hate to do this but I really can't make it tonight. I'm disappointed and hope you understand.",
  Angry:
    "Look, I'm cancelling. Too much going on and I'm frustrated.",
  Compelling:
    "I have to cancel because I got an important commitment I can't miss. Thanks for understanding!",
  Persuasive:
    "Would you mind if we postponed? I think meeting later will be much better for both of us.",
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
    <div className="dragdrop-game">
      <h2>Drag a tone into the blank</h2>
      <p className="sentence">
        Write a
        <span
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {selected ? ` ${selected} ` : ' ____ '}
        </span>
        short text to cancel my plans with a friend.
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
              <button onClick={handleSubmit} disabled={!userMessage.trim()}>
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
            What tone should you use when writing a message to your boss that you
            will be out of work sick today?
          </p>
          <div className="options">
            {tones.map((tone) => (
              <button
                key={tone}
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
  )
}
