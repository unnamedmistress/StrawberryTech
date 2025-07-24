export const ADVENTURE_GAMES = [
  { key: 'tone', path: '/games/tone', title: 'Tone Puzzle' },
  { key: 'quiz', path: '/games/quiz', title: 'Hallucinations' },
  { key: 'recipe', path: '/games/recipe', title: 'Prompt Builder' },
  { key: 'escape', path: '/games/escape', title: 'Escape Room' },
] as const

export type AdventureGameKey = typeof ADVENTURE_GAMES[number]['key']

export function getAdventureStep(points: Record<string, number>): number {
  for (let i = 0; i < ADVENTURE_GAMES.length; i++) {
    if (!points[ADVENTURE_GAMES[i].key]) return i
  }
  return ADVENTURE_GAMES.length
}

export function getNextGame(points: Record<string, number>) {
  const step = getAdventureStep(points)
  return ADVENTURE_GAMES[step] ?? null
}

export function pointsToStars(points: number): number {
  return Math.max(1, Math.round(points / 50))
}
