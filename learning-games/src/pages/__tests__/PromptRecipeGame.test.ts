import { describe, it, expect } from 'vitest'
import {
  evaluateRecipe,
  parseCardLines,
  type Dropped,
  type Card,
} from '../PromptRecipeGame'

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

describe('parseCardLines', () => {
  it('parses prefix style lines', () => {
    const text =
      'Action: Write an email\nContext: for a job\nFormat: bullet\nConstraints: short'
    const result = parseCardLines(text)
    expect(result).toEqual([
      'Write an email',
      'for a job',
      'bullet',
      'short',
    ])
  })

  it('parses label on one line and value on next line', () => {
    const text =
      'Action\nWrite an email\nContext\nfor a job\nFormat\nbullet\nConstraints\nshort'
    const result = parseCardLines(text)
    expect(result).toEqual([
      'Write an email',
      'for a job',
      'bullet',
      'short',
    ])
  })
})
