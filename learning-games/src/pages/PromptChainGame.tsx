import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

import InstructionBanner from '../components/ui/InstructionBanner'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import CompletionModal from '../components/ui/CompletionModal'
import WhyCard from '../components/layout/WhyCard'
import TimerBar from '../components/ui/TimerBar'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import { getTimeLimit } from '../utils/time'
import './PromptChainGame.css'

interface ChainStep {
  id: number
  instruction: string
  placeholder: string
  correctAnswer: string
  hint: string
}

interface Challenge {
  id: number
  title: string
  scenario: string
  finalGoal: string
  steps: ChainStep[]
  points: number
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Research Assistant',
    scenario: 'You need to research and write a summary about renewable energy.',
    finalGoal: 'A comprehensive 200-word summary with key statistics',
    steps: [
      {
        id: 1,
        instruction: 'First, ask for basic facts about renewable energy types',
        placeholder: 'List the main types of renewable energy...',
        correctAnswer: 'List the main types of renewable energy sources and their basic definitions',
        hint: 'Start with asking for a list of types'
      },
      {
        id: 2,
        instruction: 'Next, request specific statistics about one type',
        placeholder: 'Provide statistics about solar energy...',
        correctAnswer: 'Provide current statistics about solar energy adoption and efficiency rates',
        hint: 'Ask for numbers and data about one specific type'
      },
      {
        id: 3,
        instruction: 'Finally, ask for the information to be formatted as a summary',
        placeholder: 'Combine this information into a summary...',
        correctAnswer: 'Combine this information into a 200-word summary highlighting key benefits and statistics',
        hint: 'Request a specific format with word count'
      }
    ],
    points: 100
  },
  {
    id: 2,
    title: 'Creative Writing Helper',
    scenario: 'You want to write a short story about space exploration.',
    finalGoal: 'A complete 3-paragraph story with dialogue',
    steps: [
      {
        id: 1,
        instruction: 'Start by asking for character and setting ideas',
        placeholder: 'Generate ideas for characters...',
        correctAnswer: 'Generate ideas for main characters and setting for a space exploration story',
        hint: 'Focus on who and where first'
      },
      {
        id: 2,
        instruction: 'Then request a basic plot outline',
        placeholder: 'Create a simple plot outline...',
        correctAnswer: 'Create a simple 3-act plot outline for the space exploration story with conflict',
        hint: 'Ask for story structure with beginning, middle, end'
      },
      {
        id: 3,
        instruction: 'Finally, ask for the complete story with dialogue',
        placeholder: 'Write the full story...',
        correctAnswer: 'Write the full story in 3 paragraphs including dialogue between characters',
        hint: 'Request the final product with specific formatting'
      }
    ],
    points: 120
  },
  {
    id: 3,
    title: 'Problem Solver',
    scenario: 'Help someone plan a sustainable garden.',
    finalGoal: 'A detailed garden plan with plant recommendations',
    steps: [
      {
        id: 1,
        instruction: 'First, ask about the garden conditions and constraints',
        placeholder: 'What information do I need about the garden space...',
        correctAnswer: 'What information do I need about garden size, climate, and soil conditions for planning',
        hint: 'Ask what questions to ask the person'
      },
      {
        id: 2,
        instruction: 'Next, request plant recommendations based on the conditions',
        placeholder: 'Suggest plants for a small sunny garden...',
        correctAnswer: 'Suggest sustainable plants for a small sunny garden in temperate climate with clay soil',
        hint: 'Use specific conditions to get targeted suggestions'
      },
      {
        id: 3,
        instruction: 'Finally, ask for a complete garden layout plan',
        placeholder: 'Create a detailed garden plan...',
        correctAnswer: 'Create a detailed garden layout plan with plant placement and care schedule',
        hint: 'Request organization and timing information'
      }
    ],
    points: 140
  }
]

const WHY_CONTENT = {
  title: 'Why Prompt Chaining Matters',
  explanation: 'Learn to break complex tasks into manageable steps for better AI results.',
  points: [
    'Complex tasks often need to be broken into smaller, manageable steps',
    'Each prompt can build on the previous response for better results',
    'Chaining helps you get more specific and accurate outputs',
    'It prevents overwhelming the AI with too many requests at once'
  ]
}

export default function PromptChainGame() {
  const { setPoints, addBadge, user } = useContext(UserContext) as UserContextType
  
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [userPrompt, setUserPrompt] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [chainHistory, setChainHistory] = useState<string[]>([])

  const challenge = CHALLENGES[currentChallenge]
  const step = challenge.steps[currentStep]
  const timeLimit = getTimeLimit(user, { easy: 60, medium: 45, hard: 30 })

  useEffect(() => {
    setTimeRemaining(timeLimit)
  }, [currentChallenge, timeLimit])

  useEffect(() => {
    if (timeRemaining > 0 && !isCorrect) {
      const timer = setTimeout(() => setTimeRemaining(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, isCorrect])

  const checkPrompt = (userInput: string, correctAnswer: string): boolean => {
    const userWords = userInput.toLowerCase().split(/\s+/)
    const correctWords = correctAnswer.toLowerCase().split(/\s+/)
    
    // Check for key concepts
    const keyWords = correctWords.filter(word => 
      word.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that', 'about'].includes(word)
    )
    
    const matches = keyWords.filter(word => 
      userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
    )
    
    return matches.length >= Math.ceil(keyWords.length * 0.6)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userPrompt.trim()) {
      setFeedback('Please enter a prompt!')
      return
    }

    const correct = checkPrompt(userPrompt, step.correctAnswer)
    
    if (correct) {
      setIsCorrect(true)
      setFeedback('Excellent! That prompt captures the key elements.')
      setChainHistory(prev => [...prev, userPrompt])
      
      // Award points based on time remaining
      const stepPoints = Math.max(10, Math.floor(timeRemaining / 2))
      setTotalScore(prev => prev + stepPoints)
      
      // Move to next step after delay
      setTimeout(() => {
        if (currentStep + 1 < challenge.steps.length) {
          setCurrentStep(prev => prev + 1)
          setUserPrompt('')
          setFeedback('')
          setIsCorrect(false)
          setShowHint(false)
          setTimeRemaining(timeLimit)
        } else {
          // Challenge complete
          completeChallenge()
        }
      }, 2000)
    } else {
      setFeedback('Not quite right. Think about what specific information you need.')
      setShowHint(true)
    }
  }

  const completeChallenge = () => {
    const challengeBonus = challenge.points
    const finalScore = totalScore + challengeBonus
    setTotalScore(finalScore)
    
    // Award badges
    if (timeRemaining > timeLimit * 0.7) {
      addBadge('chain-master')
    }
    if (currentChallenge === 0 && !showHint) {
      addBadge('first-chain')
    }
    
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    
    if (currentChallenge + 1 < CHALLENGES.length) {
      setTimeout(() => {
        setCurrentChallenge(prev => prev + 1)
        setCurrentStep(0)
        setUserPrompt('')
        setFeedback('')
        setIsCorrect(false)
        setShowHint(false)
        setChainHistory([])
        setTimeRemaining(timeLimit)
      }, 3000)
    } else {
      // All challenges complete
      setPoints('chain', finalScore)
      setGameComplete(true)
    }
  }
  const handleHint = () => {
    setFeedback(`Hint: ${step.hint}`)
    setShowHint(true)
  }

  return (
    <>
      <div id="main-content" className="chain-page">
        <InstructionBanner>
          Break complex tasks into a chain of simple prompts
        </InstructionBanner>
        
        <div className="chain-wrapper">
          <aside className="chain-sidebar">
            <h3>Challenge {currentChallenge + 1}/{CHALLENGES.length}</h3>
            <h4>{challenge.title}</h4>
            <p className="scenario">{challenge.scenario}</p>
            <p className="goal"><strong>Goal:</strong> {challenge.finalGoal}</p>
            
            <div className="chain-progress">
              <h5>Chain Progress</h5>
              {challenge.steps.map((s, idx) => (
                <div 
                  key={s.id} 
                  className={`step-indicator ${idx < currentStep ? 'completed' : idx === currentStep ? 'current' : 'upcoming'}`}
                >
                  Step {idx + 1}
                  {idx < currentStep && ' ✓'}
                </div>
              ))}
            </div>

            {chainHistory.length > 0 && (
              <div className="chain-history">
                <h5>Your Chain</h5>
                {chainHistory.map((prompt, idx) => (
                  <div key={idx} className="history-item">
                    <strong>Step {idx + 1}:</strong> {prompt}
                  </div>
                ))}
              </div>
            )}
          </aside>

          <main className="chain-game">
            <div className="step-header">
              <h3>Step {currentStep + 1} of {challenge.steps.length}</h3>
              <TimerBar timeLeft={timeRemaining} TOTAL_TIME={timeLimit} />
            </div>

            <div className="step-instruction">
              <p>{step.instruction}</p>
            </div>

            <form onSubmit={handleSubmit} className="prompt-form">
              <textarea
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                placeholder={step.placeholder}
                rows={3}
                disabled={isCorrect}
                aria-label="Enter your prompt for this step"
              />
              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isCorrect}
                >
                  Submit Step
                </button>
                <button 
                  type="button" 
                  onClick={handleHint}
                  className="btn-secondary"
                  disabled={showHint || isCorrect}
                >
                  Need a Hint?
                </button>
              </div>
            </form>

            <AnimatePresence>
              {feedback && (
                <motion.div 
                  className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>

            {isCorrect && currentStep + 1 < challenge.steps.length && (
              <motion.div 
                className="next-step-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p><strong>Next:</strong> {challenge.steps[currentStep + 1].instruction}</p>
              </motion.div>
            )}

            {isCorrect && currentStep + 1 >= challenge.steps.length && (
              <motion.div 
                className="challenge-complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <h3>Challenge Complete! 🎉</h3>
                <p>You've successfully chained {challenge.steps.length} prompts together!</p>
                <p className="score">Score: {totalScore} points</p>
              </motion.div>
            )}
          </main>

          <ProgressSidebar />
        </div>

        <WhyCard {...WHY_CONTENT} />
      </div>

      {gameComplete && (
        <CompletionModal
          imageSrc="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png"
          buttonHref="/leaderboard"
          buttonLabel="View Progress"
        >
          <h3>Prompt Chain Master! 🏆</h3>
          <p>You've mastered the art of breaking complex tasks into simple prompt chains.</p>
          <p className="final-score">Final Score: {totalScore} points</p>
          <div className="completion-tips">
            <h4>Key Learning:</h4>
            <ul>
              <li>Complex tasks work better as step-by-step chains</li>
              <li>Each prompt should build on the previous response</li>
              <li>Be specific about format and requirements in each step</li>
            </ul>
          </div>
        </CompletionModal>
      )}
    </>
  )
}
