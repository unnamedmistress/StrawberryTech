export interface BadgeDefinition {
  id: string
  name: string
  description: string
}

/** List of all possible badges and their criteria descriptions. */
export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-match3',
    name: 'First Tone Game Complete',
    description: 'Finish a Tone game once',
  },
  {
    id: 'match-master',
    name: 'Tone Master',
    description: 'Score at least 100 points in Tone',
  },
  {
    id: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Get a perfect score on any quiz',
  },
  {
    id: 'tone-whiz',
    name: 'Tone Tactician',
    description: 'Matched every tone correctly in the mini-game',
  },
  {

    id: 'escape-artist',
    name: 'Escape Artist of Clarity',
    description: 'Exit all 5 rooms under 3 minutes',
  },
  {

    id: 'prompt-chef',
    name: 'Master Chef of Prompts',
    description: 'Create 10 flawless prompt recipes',
  },
]
