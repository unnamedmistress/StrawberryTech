export interface ScoreDetails {
  score: number
  tips: string[]
}

const ACTION_WORDS = ['write','tell','show','give','describe','explain','summarize','suggest']
const DESCRIPTIVE = /simple|quick|short|daily|weekly|fun|persuasive/
const CONTEXT_REGEX = /\d+|teacher|teen|student|man|python|cell|water|french/

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(Boolean)
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return magA && magB ? dot / (magA * magB) : 0
}

function semanticSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  const vocab = Array.from(new Set([...tokensA, ...tokensB]))
  const vectorA = vocab.map(tok => tokensA.filter(t => t === tok).length)
  const vectorB = vocab.map(tok => tokensB.filter(t => t === tok).length)
  return cosineSimilarity(vectorA, vectorB)
}

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

  const similarity = semanticSimilarity(normExpected, normGuess)
  if (similarity > 0.6) {
    score += 5
  }

  if (DESCRIPTIVE.test(normGuess)) {
    score += 5
  }

  return { score, tips }
}
