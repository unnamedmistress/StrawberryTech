import { describe, it, expect } from 'vitest'
import { checkChoice, ROUNDS } from '../PromptDartsGame'

describe('checkChoice', () => {
  it('returns true only for the clear option', () => {
    const round = ROUNDS[0]
    expect(checkChoice(round, round.correct)).toBe(true)
    expect(checkChoice(round, (round.correct + 1) % round.options.length)).toBe(false)
  })

  it('each round provides a canned response', () => {
    for (const round of ROUNDS) {
      expect(round.response).toBeDefined()
      expect(typeof round.response).toBe('string')
    }
  })
})
