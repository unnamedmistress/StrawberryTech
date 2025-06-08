import { describe, it, expect } from 'vitest'
import {
  evaluateRecipe,
  parseCardLines,
  ensureCardSet,
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

describe('ensureCardSet', () => {
  it('fills missing categories with defaults', () => {
    const result = ensureCardSet(['Do it', 'quickly'])
    expect(result).toHaveLength(4)
    expect(result[0].type).toBe('Action')
    expect(result[0].text).toBe('Do it')
    expect(result[1].type).toBe('Context')
    expect(result[1].text).toBe('quickly')
    expect(result[2].type).toBe('Format')
    expect(typeof result[2].text).toBe('string')
    expect(result[3].type).toBe('Constraints')
    expect(typeof result[3].text).toBe('string')
  })
})
