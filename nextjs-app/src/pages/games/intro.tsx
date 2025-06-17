import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import JsonLd from '../../components/seo/JsonLd'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import EmailIntroModal from '../../components/ui/EmailIntroModal'
import CompletionModal from '../../components/ui/CompletionModal'
import ProgressBar from '../../components/ui/ProgressBar'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import { GOAL_POINTS } from '../../constants/progress'
import styles from '../../styles/IntroGame.module.css'

interface SentenceOption {
  text: string
  best?: boolean
}

interface Topic {
  name: string
  sentences: SentenceOption[]
}

interface EmailContext {
  label: string
  openers: SentenceOption[]
  topics: Topic[]
}

const EMAIL_DATA: Record<string, EmailContext> = {
  meeting: {
    label: 'Scheduling Meeting',
    openers: [
      { text: 'I hope you\'re doing well.' },
      { text: 'I\'m writing to schedule our meeting.', best: true },
      { text: 'Just reaching out to find a good time to connect.' },
    ],
    topics: [
      {
        name: 'Propose Meeting Time',
        sentences: [
          { text: 'Could we meet on Tuesday at 3 PM?', best: true },
          { text: 'Are you free Tuesday afternoon?' },
          { text: 'Let\'s plan to meet sometime Tuesday.' },
        ],
      },
      {
        name: 'Ask Availability',
        sentences: [
          { text: 'What time works best for you?', best: true },
          { text: 'When might you be available?' },
          { text: 'Let me know your preferred time.' },
        ],
      },
      {
        name: 'Mention Agenda',
        sentences: [
          { text: 'I\'ll share a short agenda before we meet.', best: true },
          { text: 'I\'ll send over the discussion points soon.' },
          { text: 'I\'ll outline our topics beforehand.' },
        ],
      },
    ],
  },
  followup: {
    label: 'Following Up',
    openers: [
      { text: 'I hope you\'re having a good week.' },
      { text: 'I\'m following up on our last conversation.', best: true },
      { text: 'Just checking in regarding my previous email.' },
    ],
    topics: [
      {
        name: 'Request Update',
        sentences: [
          { text: 'Do you have any updates for me?', best: true },
          { text: 'Have you had a chance to review?' },
          { text: 'Could you share your thoughts?' },
        ],
      },
      {
        name: 'Offer Help',
        sentences: [
          { text: 'I\'m happy to answer any questions.', best: true },
          { text: 'Let me know if anything is unclear.' },
          { text: 'I\'d be glad to provide more details.' },
        ],
      },
      {
        name: 'Mention Deadline',
        sentences: [
          { text: 'We\'re hoping to finalize this by Friday.', best: true },
          { text: 'A quick response would be appreciated.' },
          { text: 'Please reply when you can.' },
        ],
      },
    ],
  },
  thankyou: {
    label: 'Thank You',
    openers: [
      { text: 'Thank you so much for your help.', best: true },
      { text: 'I really appreciate your assistance.' },
      { text: 'I wanted to express my gratitude for your support.' },
    ],
    topics: [
      {
        name: 'Acknowledge Effort',
        sentences: [
          { text: 'Your quick response made all the difference.', best: true },
          { text: 'You really went above and beyond.' },
          { text: 'I recognize the time you put into this.' },
        ],
      },
      {
        name: 'Offer Future Help',
        sentences: [
          { text: 'Please let me know if I can return the favor.', best: true },
          { text: 'Don\'t hesitate to reach out if you need anything.' },
          { text: 'Feel free to contact me whenever you need help.' },
        ],
      },
      {
        name: 'Close Warmly',
        sentences: [
          { text: 'Looking forward to working with you again.', best: true },
          { text: 'Hope we can collaborate again soon.' },
          { text: 'Can\'t wait to work together next time.' },
        ],
      },
    ],
  },
}

export default function IntroGame() {
  const router = useRouter()
  const { setPoints, addBadge, user } = useContext(UserContext) as UserContextType

  const [showIntro, setShowIntro] = useState(true)
  const [step, setStep] = useState<'context' | 'opener' | 'topic' | 'sentence' | 'review'>('context')
  const TOTAL_SENTENCES = 3
  const [round, setRound] = useState(0)
  const [contextKey, setContextKey] = useState<string>('')
  const [topicIndex, setTopicIndex] = useState<number>(0)
  const [usedTopics, setUsedTopics] = useState<number[]>([])
  const [email, setEmail] = useState<string[]>([])
  const [typingLine, setTypingLine] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [points, setPointsState] = useState(0)
  const [finalEmail, setFinalEmail] = useState('')
  const [generating, setGenerating] = useState(false)

  const context = EMAIL_DATA[contextKey]

  function typeLine(text: string, after: () => void) {
    setIsTyping(true)
    setTypingLine('')
    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      setTypingLine(text.slice(0, idx))
      if (idx >= text.length) {
        clearInterval(interval)
        setEmail(prev => [...prev, text])
        setTypingLine('')
        setIsTyping(false)
        after()
      }
    }, 30)
  }

  function chooseContext(key: string) {
    setContextKey(key)
    setStep('opener')
  }

  function chooseOpener(opener: SentenceOption) {
    setPointsState(p => p + 10)
    typeLine(opener.text, () => setStep('topic'))
  }

  function chooseTopic(idx: number) {
    setTopicIndex(idx)
    setStep('sentence')
  }

  function chooseSentence(sentence: SentenceOption) {
    setUsedTopics(prev => [...prev, topicIndex])
    const gained = 15 + (sentence.best ? 20 : 0)
    const total = points + gained
    setPointsState(total)
    typeLine(sentence.text, () => {
      if (round + 1 < TOTAL_SENTENCES) {
        setRound(r => r + 1)
        setStep('topic')
      } else {
        setStep('review')
        finalize(total)
      }
    })
  }

  async function generateFullEmail(lines: string[]): Promise<string> {
    const joined = lines.join(' ')
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!key) {
      return `Hi there,\n\n${joined}\n\nBest regards,\nYour Name`
    }
    try {
      setGenerating(true)
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Write a concise, professional email incorporating the provided lines. Include a greeting and closing. Keep it under 120 words.',
            },
            { role: 'user', content: joined },
          ],
          max_tokens: 160,
          temperature: 0.7,
        }),
      })
      const data = await resp.json()
      const text: string | undefined = data?.choices?.[0]?.message?.content
      return text ? text.trim() : joined
    } catch (err) {
      console.error('Email generation failed', err)
      return joined
    } finally {
      setGenerating(false)
    }
  }

  function finalize(totalPoints: number) {
    setPoints('intro', totalPoints)
    const overall = Object.values({ ...user.points, intro: Math.max(user.points.intro ?? 0, totalPoints) }).reduce((a, b) => a + b, 0)
    if (overall >= 1000 && !user.badges.includes('prompt-master')) {
      addBadge('prompt-master')
    } else if (overall >= 600 && !user.badges.includes('email-apprentice')) {
      addBadge('email-apprentice')
    } else if (overall >= 300 && !user.badges.includes('prompt-novice')) {
      addBadge('prompt-novice')
    }
  }

  useEffect(() => {
    if (step === 'review') {
      if (!finalEmail && !generating) {
        generateFullEmail(email).then(text => setFinalEmail(text))
      }
      const timer = setTimeout(() => setShowCompletion(true), 5000)
      return () => clearTimeout(timer)
    }
    setShowCompletion(false)
  }, [step, finalEmail, generating, email])

  const percent = Math.min(100, (points / GOAL_POINTS) * 100)

  return (
    <>
      {showIntro && <EmailIntroModal onClose={() => setShowIntro(false)} />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'AI Basics',
          description: 'Build a professional email by choosing AI-suggested sentences.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png',
        }}
      />
      <ModernGameLayout
        gameTitle="AI Basics"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        showProgressSidebar
        whyCard={
          <WhyCard
            title="What is AI?"
            explanation="Think of AI as a prediction engine. It guesses the next words based on patterns, like finishing a puzzle."
            lesson={<p>Pick the options you like best to assemble a polished email.</p>}
          />
        }
      >
        <div className={styles.introGame}>
          {step === 'context' && (
            <>
              <p className={styles.prompt}>Choose the type of email</p>
              <div className={styles.options}>
                {Object.entries(EMAIL_DATA).map(([key, ctx]) => (
                  <button key={key} className="btn-primary" onClick={() => chooseContext(key)} disabled={isTyping}>
                    {ctx.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'opener' && context && (
            <>
              <p className={styles.prompt}>Select an email opener</p>
              <div className={styles.options}>
                {context.openers.map((o, i) => (
                  <button key={i} className="btn-primary" onClick={() => chooseOpener(o)} disabled={isTyping}>
                    {o.text}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'topic' && context && (
            <>
              <p className={styles.prompt}>What would you like to say next?</p>
              <div className={styles.options}>
                {context.topics.map((t, i) =>
                  usedTopics.includes(i) ? null : (
                    <button
                      key={t.name}
                      className="btn-primary"
                      onClick={() => chooseTopic(i)}
                      disabled={isTyping}
                    >
                      {t.name}
                    </button>
                  ),
                )}
              </div>
            </>
          )}

          {step === 'sentence' && context && (
            <>
              <p className={styles.prompt}>Choose a sentence</p>
              <div className={styles.options}>
                {context.topics[topicIndex].sentences.map((s, i) => (
                  <button key={i} className="btn-primary" onClick={() => chooseSentence(s)} disabled={isTyping}>
                    {s.text}
                  </button>
                ))}
              </div>
            </>
          )}

          {(email.length > 0 || isTyping) && step !== 'review' && (
            <div className={styles.storyText} style={{ textAlign: 'left' }}>
              <h3>Email So Far</h3>
              {email.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              {isTyping && <p>{typingLine}</p>}
            </div>
          )}

          {step === 'review' && (
            <div className={styles.storyText} style={{ textAlign: 'left' }}>
              <h3>Email Preview</h3>
              {generating && <p>Generating email...</p>}
              {!generating && finalEmail && (
                finalEmail.split('\n').map((line, i) => <p key={i}>{line}</p>)
              )}
              {!generating && !finalEmail &&
                email.map((line, i) => <p key={i}>{line}</p>)}
              <p className={styles.finalScore}>Total Points: {points}</p>
              <ProgressBar percent={percent} />
            </div>
          )}
        </div>
      </ModernGameLayout>
      {showCompletion && (
        <CompletionModal
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          buttonHref="/games/tone"
          buttonLabel="Play Tone Game"
        >
          <h3>Great job!</h3>
          <p>You built a professional email with AI assistance.</p>
          <div className={styles['completion-tips']}>
            <h4>Lesson Recap</h4>
            <ul>
              <li>AI suggests words by predicting what comes next.</li>
              <li>Combining an opener and new topics creates a clear message.</li>
              <li>Avoid repeating topics to keep the email focused.</li>
            </ul>
          </div>
        </CompletionModal>
      )}
    </>
  )
}

export function Head() {
  return (
    <>
      <title>AI Basics | StrawberryTech</title>
      <meta name="description" content="Build a professional email step by step." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/intro" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
