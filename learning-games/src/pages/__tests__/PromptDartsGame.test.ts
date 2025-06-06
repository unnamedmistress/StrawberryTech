import { describe, it, expect } from 'vitest'
import { checkChoice, ROUNDS } from '../PromptDartsGame'

describe('checkChoice', () => {
  it('returns true only for the clear option', () => {
    const round = ROUNDS[0]
    expect(checkChoice(round, 'good')).toBe(true)
    expect(checkChoice(round, 'bad')).toBe(false)
  })
})
