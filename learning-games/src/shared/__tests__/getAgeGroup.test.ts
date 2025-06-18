import { describe, it, expect } from 'vitest'
import { getAgeGroup } from '../../../../shared/getAgeGroup'

describe('getAgeGroup', () => {
  it('maps numbers to groups', () => {
    expect(getAgeGroup(5)).toBe('child')
    expect(getAgeGroup(15)).toBe('teen')
    expect(getAgeGroup(30)).toBe('adult')
    expect(getAgeGroup(70)).toBe('senior')
  })
})
