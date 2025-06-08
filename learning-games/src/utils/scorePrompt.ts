export interface ScoreDetails {
  score: number
  tips: string[]
}

const ACTION_WORDS = ['write','tell','show','give','describe','explain','summarize','suggest']
const DESCRIPTIVE = /simple|quick|short|daily|weekly|fun|persuasive/
const CONTEXT_REGEX = /\d+|teacher|teen|student|man|python|cell|water|french/

export function scorePrompt(expected: string, guess: string): ScoreDetails {
  const normGuess = guess.toLowerCase()
  const normExpected = expected.toLowerCase()
  let score = 0
  const tips: string[] = []

  const tokens = normExpected.split(/\W+/).filter(Boolean)
  const overlap = tokens.filter(t => normGuess.includes(t))
  const hasOverlap = overlap.length >= Math.max(1, Math.floor(tokens.length / 2))
  if (hasOverlap) {
    score += 10
  } else if (tokens.length) {
    tips.push(`Include key words like "${tokens[0]}"`)
  }

  const contextMatch = CONTEXT_REGEX.exec(normExpected)
  const hasContext = contextMatch && normGuess.includes(contextMatch[0])
  if (hasContext) {
    score += 10
  } else if (contextMatch) {
    tips.push(`Mention "${contextMatch[0]}"`)
  }

  const hasAction = ACTION_WORDS.some(w => normGuess.includes(w))
  if (hasAction) {
    score += 5
  } else {
    tips.push('Start with an action word like "write" or "describe"')
  }

  if (DESCRIPTIVE.test(normGuess)) {
    score += 5
  }

  return { score, tips }
}
