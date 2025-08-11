import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import JsonLd from '../../components/seo/JsonLd'
import ModernGameLayout from '../../components/layout/ModernGameLayout'
import WhyCard from '../../components/layout/WhyCard'
import CompletionModal from '../../components/ui/CompletionModal'
import EmailPreviewModal from '../../components/ui/EmailPreviewModal'
import ProgressBar from '../../components/ui/ProgressBar'
import { UserContext } from '../../shared/UserContext'
import type { UserContextType } from '../../shared/types/user'
import { GOAL_POINTS } from '../../constants/progress'
import styles from '../../styles/IntroGame.module.css'

interface SentenceOption {
  text: string
  best?: boolean
  hint?: string
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
      { text: 'I\'m writing to schedule our meeting.', best: true, hint: 'States the purpose clearly' },
      { text: 'Just reaching out to find a good time to connect.' },
    ],
    topics: [
      {
        name: 'Propose Meeting Time',
        sentences: [
          { text: 'Could we meet on Tuesday at 3 PM?', best: true, hint: 'Specific time suggestion' },
          { text: 'Are you free Tuesday afternoon?' },
          { text: 'Let\'s plan to meet sometime Tuesday.' },
        ],
      },
      {
        name: 'Ask Availability',
        sentences: [
          { text: 'What time works best for you?', best: true, hint: 'Asks directly for availability' },
          { text: 'When might you be available?' },
          { text: 'Let me know your preferred time.' },
        ],
      },
      {
        name: 'Mention Agenda',
        sentences: [
          { text: 'I\'ll share a short agenda before we meet.', best: true, hint: 'Prepares the recipient' },
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
      { text: 'I\'m following up on our last conversation.', best: true, hint: 'Reminds them of prior discussion' },
      { text: 'Just checking in regarding my previous email.' },
    ],
    topics: [
      {
        name: 'Request Update',
        sentences: [
          { text: 'Do you have any updates for me?', best: true, hint: 'Politely requests progress' },
          { text: 'Have you had a chance to review?' },
          { text: 'Could you share your thoughts?' },
        ],
      },
      {
        name: 'Offer Help',
        sentences: [
          { text: 'I\'m happy to answer any questions.', best: true, hint: 'Offers assistance' },
          { text: 'Let me know if anything is unclear.' },
          { text: 'I\'d be glad to provide more details.' },
        ],
      },
      {
        name: 'Mention Deadline',
        sentences: [
          { text: 'We\'re hoping to finalize this by Friday.', best: true, hint: 'Communicates a deadline' },
          { text: 'A quick response would be appreciated.' },
          { text: 'Please reply when you can.' },
        ],
      },
    ],
  },
  thankyou: {
    label: 'Thank You',
    openers: [
      { text: 'Thank you so much for your help.', best: true, hint: 'Expresses gratitude plainly' },
      { text: 'I really appreciate your assistance.' },
      { text: 'I wanted to express my gratitude for your support.' },
    ],
    topics: [
      {
        name: 'Acknowledge Effort',
        sentences: [
          { text: 'Your quick response made all the difference.', best: true, hint: 'Praises the recipient directly' },
          { text: 'You really went above and beyond.' },
          { text: 'I recognize the time you put into this.' },
        ],
      },
      {
        name: 'Offer Future Help',
        sentences: [
          { text: 'Please let me know if I can return the favor.', best: true, hint: 'Offers future assistance' },
          { text: 'Don\'t hesitate to reach out if you need anything.' },
          { text: 'Feel free to contact me whenever you need help.' },
        ],
      },
      {
        name: 'Close Warmly',
        sentences: [
          { text: 'Looking forward to working with you again.', best: true, hint: 'Ends on a positive note' },
          { text: 'Hope we can collaborate again soon.' },
          { text: 'Can\'t wait to work together next time.' },
        ],
      },
    ],
  },
  jobapp: {
    label: 'Job Application',
    openers: [
      { text: 'I am excited to apply for the open position.', best: true, hint: 'Shows enthusiasm for the role' },
      { text: 'Please consider my attached resume.' },
      { text: 'I would love to join your team.' },
    ],
    topics: [
      {
        name: 'Highlight Skills',
        sentences: [
          { text: 'My experience aligns well with the job requirements.', best: true, hint: 'Connects skills to the role' },
          { text: 'I have many of the skills you listed.' },
          { text: 'My background matches what you need.' },
        ],
      },
      {
        name: 'Request Interview',
        sentences: [
          { text: 'Could we schedule a short interview?', best: true, hint: 'Politely asks for next step' },
          { text: 'I would appreciate the chance to discuss the role.' },
          { text: 'I hope to talk more about this opportunity.' },
        ],
      },
    ],
  },
  support: {
    label: 'Support Request',
    openers: [
      { text: 'I need help with a recent order.', best: true, hint: 'States the issue right away' },
      { text: 'I am writing about a problem I encountered.' },
      { text: 'I hope you can assist me with an issue.' },
    ],
    topics: [
      {
        name: 'Describe Issue',
        sentences: [
          { text: 'The product arrived damaged.', best: true, hint: 'Clear description of the problem' },
          { text: 'Something is wrong with what I received.' },
          { text: 'The item is not functioning as expected.' },
        ],
      },
      {
        name: 'Ask for Help',
        sentences: [
          { text: 'Can you send a replacement or refund?', best: true, hint: 'Clearly states the request' },
          { text: 'What can be done to resolve this?' },
          { text: 'Please advise on next steps.' },
        ],
      },
    ],
  },
}

const ALL_OPENERS = Object.entries(EMAIL_DATA).flatMap(([context, ctx]) =>
  ctx.openers.map(o => ({ ...o, context }))
)

export default function IntroGame() {
  const router = useRouter()
  const { setPoints, addBadge, user, ageGroup } = useContext(UserContext) as UserContextType

  const [step, setStep] = useState<'opener' | 'sentence' | 'review'>('opener')
  const TOTAL_SENTENCES = 3
  const [round, setRound] = useState(0)
  const [contextKey, setContextKey] = useState<string>('')
  const [email, setEmail] = useState<string[]>([])
  const [typingLine, setTypingLine] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [points, setPointsState] = useState(0)
  const [finalEmail, setFinalEmail] = useState('')
  const [generating, setGenerating] = useState(false)
  const [options, setOptions] = useState<SentenceOption[]>([])
  const [lastHint, setLastHint] = useState('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [showDebug, setShowDebug] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizResult, setQuizResult] = useState('')

  const context = EMAIL_DATA[contextKey]

  useEffect(() => {
    if (step === 'sentence' && contextKey) {
      fetch(`/api/suggest?context=${contextKey}`)
        .then(r => r.json())
        .then(data =>
          setOptions((data.suggestions || []).map((t: string) => ({ text: t })))
        )
        .catch(() => setOptions([]))
    } else {
      setOptions([])
    }
  }, [step, contextKey, round])

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
    }, 60)
  }

  function chooseOpener(opener: { context: string } & SentenceOption) {
    setContextKey(opener.context)
    setPointsState(p => p + 10)
    typeLine(opener.text, () => setStep('sentence'))
  }

  function chooseSentence(sentence: SentenceOption) {
    const gained = 15 + (sentence.best ? 20 : 0)
    const total = points + gained
    setPointsState(total)
    const hintText =
      sentence.hint ||
      (sentence.best
        ? 'Great choice! It is clear and specific.'
        : 'This works, but another option may be clearer.')
    setLastHint(hintText)
    typeLine(sentence.text, () => {
      if (round + 1 < TOTAL_SENTENCES) {
        setRound(r => r + 1)
        setStep('sentence')
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
                `Write a concise, professional email for a ${ageGroup} user incorporating the provided lines. Include a greeting and closing. Keep it under 120 words.`,
            },
            { role: 'user', content: joined },
          ],
          max_tokens: 160,
          temperature: 0.7,
        }),
      })
      const data = await resp.json()
      const text: string | undefined = data?.choices?.[0]?.message?.content
      setDebugInfo(JSON.stringify({ request: { lines }, response: data }, null, 2))
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

  function checkQuiz() {
    if (quizAnswer === 'predict') {
      setQuizResult('Correct! AI predicts the next words.')
    } else {
      setQuizResult('Not quite. AI is guessing the next likely words.')
    }
  }

  useEffect(() => {
    if (step === 'review') {
      if (!finalEmail && !generating) {
        generateFullEmail(email).then(text => setFinalEmail(text))
      }
    } else {
      setShowCompletion(false)
      setShowEmailPreview(false)
      setFinalEmail('')
    }
  }, [step, finalEmail, generating, email])

  useEffect(() => {
    if (step === 'review' && finalEmail && !showEmailPreview) {
      setShowEmailPreview(true)
    }
  }, [finalEmail, step, showEmailPreview])

  function handlePreviewClose() {
    setShowEmailPreview(false)
    setShowCompletion(true)
  }

  function restartGame() {
    setStep('opener')
    setRound(0)
    setContextKey('')
    setEmail([])
    setTypingLine('')
    setIsTyping(false)
    setShowCompletion(false)
    setShowEmailPreview(false)
    setPointsState(0)
    setFinalEmail('')
    setOptions([])
    setLastHint('')
    setDebugInfo('')
    setShowDebug(false)
    setQuizAnswer('')
    setQuizResult('')
  }

  const percent = Math.min(100, (points / GOAL_POINTS) * 100)

  return (
    <>
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
        instructions={
          <ul className={styles.instructions}>
            <li>Pick the type of email you need.</li>
            <li>Choose three lines suggested by AI.</li>
            <li>Watch the preview grow after each choice.</li>
          </ul>
        }
        whyCard={
          <WhyCard
            title="What is AI?"
            explanation="Think of AI as a prediction engine. It studies heaps of example text then guesses the most likely next word."
            lesson={
              <p>
                Each selection helps the model refine its guess. Notice how
                concise, specific lines often score higher.
              </p>
            }
            examples={[
              { good: 'Could we meet Tuesday at 2?', bad: 'Maybe we can meet.' },
              { good: 'Please let me know your availability.', bad: 'Let me know.' }
            ]}
          />
        }
      >
        <div className={styles.introGame}>
          {step === 'opener' && (
            <>
              <p className={styles.prompt}>Select an email opener</p>
              <div className={styles.options}>
                {ALL_OPENERS.map((o, i) => (
                  <button key={i} className="btn-primary" onClick={() => chooseOpener(o)} disabled={isTyping}>
                    {o.text}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'sentence' && context && (
            <>
              <p className={styles.prompt}>Choose a sentence</p>
              <div className={styles.options}>
                {(options.length ? options : context.topics.flatMap(t => t.sentences)).map((s, i) => (
                  <button
                    key={i}
                    className="btn-primary"
                    onClick={() => chooseSentence(s)}
                    disabled={isTyping}
                    title={s.hint}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
              {lastHint && <p className={styles.hint}>{lastHint}</p>}
            </>
          )}

          {(email.length > 0 || isTyping) && step !== 'review' && (
            <div className={styles.storyText} style={{ textAlign: 'left' }}>
              <h3>Email So Far</h3>
              {email.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              {isTyping && <p>{typingLine}</p>}
              <button className="btn-secondary" onClick={restartGame} disabled={isTyping}>
                Restart
              </button>
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
              {debugInfo && showDebug && (
                <pre className={styles.debug}>{debugInfo}</pre>
              )}
              {debugInfo && (
                <button className="btn-secondary" onClick={() => setShowDebug(s => !s)}>
                  {showDebug ? 'Hide Debug' : 'Show Debug'}
                </button>
              )}
              <button className="btn-secondary" onClick={restartGame}>
                Restart
              </button>
            </div>
          )}
        </div>
      </ModernGameLayout>
      {showEmailPreview && finalEmail && (
        <EmailPreviewModal emailText={finalEmail} onClose={handlePreviewClose} />
      )}
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
          <div className={styles.quiz}>
            <p>Quick Quiz: What is the AI doing in this game?</p>
            <label>
              <input
                type="radio"
                name="quiz"
                value="predict"
                onChange={e => setQuizAnswer(e.target.value)}
              />
              Predicting the next words
            </label>
            <label>
              <input
                type="radio"
                name="quiz"
                value="mind"
                onChange={e => setQuizAnswer(e.target.value)}
              />
              Reading your mind
            </label>
            <label>
              <input
                type="radio"
                name="quiz"
                value="magic"
                onChange={e => setQuizAnswer(e.target.value)}
              />
              Doing magic
            </label>
            <button className="btn-primary" onClick={checkQuiz}>Check</button>
            {quizResult && <p>{quizResult}</p>}
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
