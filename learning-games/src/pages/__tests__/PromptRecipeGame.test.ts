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
      Audience: null,
      Setting: null,
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
      Audience: null,
      Setting: null,
    }
    const result = evaluateRecipe(dropped, cards)
    expect(result.score).toBe(3)
    expect(result.perfect).toBe(false)
  })
})

describe('parseCardLines', () => {
  it('handles prefixes on same line', () => {
    const text = 'Action: Write\nContext: About\nFormat: List\nConstraints: Short'
    expect(parseCardLines(text)).toEqual(['Write', 'About', 'List', 'Short'])
  })

  it('handles label lines separately', () => {
    const text = 'Action\nWrite an email\nContext\nFor work\nFormat\nBullet\nConstraints\nBrief'
    expect(parseCardLines(text)).toEqual([
      'Write an email',
      'For work',
      'Bullet',
      'Brief',
    ])
  })
})
