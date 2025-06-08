export function getTimeLimit(
  user: { age: number | null; difficulty: 'easy' | 'medium' | 'hard' },
  base: { easy: number; medium: number; hard: number },
): number {
  const baseTime = base[user.difficulty]
  if (user.difficulty !== 'easy') {
    return baseTime
  }
  const age = user.age ?? 0
  if (age >= 60) return baseTime + 15
  if (age >= 50) return baseTime + 10
  if (age >= 40) return baseTime + 5
  return baseTime
}
