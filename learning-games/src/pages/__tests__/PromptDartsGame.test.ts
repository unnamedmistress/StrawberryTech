import { describe, it, expect } from 'vitest'
import { checkChoice, ROUNDS, streakBonus } from '../PromptDartsGame'

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

describe('streakBonus', () => {
  it('rewards bonus on streak multiples', () => {
    expect(streakBonus(3)).toBeGreaterThan(0)
    expect(streakBonus(6)).toBeGreaterThan(0)
  })

  it('returns 0 otherwise', () => {
    expect(streakBonus(1)).toBe(0)
    expect(streakBonus(2)).toBe(0)
  })
})
