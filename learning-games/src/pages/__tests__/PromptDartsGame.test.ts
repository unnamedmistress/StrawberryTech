import { describe, it, expect } from 'vitest'
import { checkChoice, FALLBACK_ROUNDS } from '../PromptDartsGame'

describe('checkChoice', () => {
  it('returns true only for the clear option', () => {
    const round = FALLBACK_ROUNDS[0]
    expect(checkChoice(round, 'good')).toBe(true)
    expect(checkChoice(round, 'bad')).toBe(false)
  })

  it('each round provides a canned response', () => {
    for (const round of FALLBACK_ROUNDS) {
      expect(round.response).toBeDefined()
      expect(typeof round.response).toBe('string')
    }
  })
})
