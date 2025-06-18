export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior'

/**
 * Map a numeric age to a broad age group used to tailor AI prompts.
 */
export function getAgeGroup(age?: number | null): AgeGroup {
  if (age == null) return 'adult'
  if (age < 13) return 'child'
  if (age < 18) return 'teen'
  if (age < 65) return 'adult'
  return 'senior'
}
