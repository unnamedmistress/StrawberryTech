import { describe, it, expect } from 'vitest'
import { HALLUCINATION_EXAMPLES } from '../../data/hallucinationExamples'

describe('hallucination examples', () => {
  it('provides at least two examples with sources', () => {
    expect(HALLUCINATION_EXAMPLES.length).toBeGreaterThanOrEqual(2)
    for (const ex of HALLUCINATION_EXAMPLES) {
      expect(typeof ex.statement).toBe('string')
      expect(typeof ex.source).toBe('string')
    }
  })
})
