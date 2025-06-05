export interface BadgeDefinition {
  id: string
  name: string
  description: string
}

/** List of all possible badges and their criteria descriptions. */
export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-match3',
    name: 'First Match-3 Complete',
    description: 'Finish a Match-3 game once',
  },
  {
    id: 'match-master',
    name: 'Match-3 Master',
    description: 'Score at least 100 points in Match-3',
  },
  {
    id: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Get a perfect score on any quiz',
  },
]
