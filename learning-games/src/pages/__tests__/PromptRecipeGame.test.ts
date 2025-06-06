import { describe, it, expect } from 'vitest'
import { evaluateRecipe, Dropped, Card } from '../PromptRecipeGame'

describe('evaluateRecipe', () => {
  it('scores 4 and is perfect when all placements correct', () => {
    const cards: Card[] = [
      { type: 'Action', text: 'Write' },
      { type: 'Context', text: 'About' },
      { type: 'Format', text: 'In style' },
      { type: 'Constraints', text: 'Short' },
    ]
    const dropped: Dropped = {
      Action: 'Write',
      Context: 'About',
      Format: 'In style',
      Constraints: 'Short',
    }
    const result = evaluateRecipe(dropped, cards)
    expect(result.score).toBe(4)
    expect(result.perfect).toBe(true)
  })

  it('is not perfect when any placement wrong', () => {
    const cards: Card[] = [
      { type: 'Action', text: 'Write' },
      { type: 'Context', text: 'About' },
      { type: 'Format', text: 'In style' },
      { type: 'Constraints', text: 'Short' },
    ]
    const dropped: Dropped = {
      Action: 'Write',
      Context: 'Wrong',
      Format: 'In style',
      Constraints: 'Short',
    }
    const result = evaluateRecipe(dropped, cards)
    expect(result.score).toBe(3)
    expect(result.perfect).toBe(false)
  })
})
