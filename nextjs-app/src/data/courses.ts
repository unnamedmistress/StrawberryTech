export interface CourseMeta {
  id: string
  title: string
  description: string
  path: string
  meme?: string
}

/** Basic metadata for each available course */
export const COURSES: CourseMeta[] = [
  {
    id: 'intro',
    title: 'AI Basics',
    description: 'Discover how AI predicts the next word.',
    path: '/games/intro',
    meme: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTExbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif',
  },
  {
    id: 'tone',
    title: 'Tone Puzzle',
    description: 'Swap adjectives to explore how tone changes a message.',
    path: '/games/tone',
    meme:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTExbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif',
  },
  {
    id: 'quiz',
    title: 'Hallucinations Quiz',
    description: 'Spot the AI hallucination hidden among the facts.',
    path: '/games/quiz',
    meme:
      'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTZoaHpxY3AwbmN1OTMwN3dkY3c5eXI1eXB3cDJ5ajNudDdkcnJ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/SR6WK6jz0rRWf2QK0t/giphy.gif',
  },
  {
    id: 'escape',
    title: 'Clarity Escape Room',
    description: 'Solve vague tasks with precise prompts to escape.',
    path: '/games/escape',
    meme:
      'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGxwaGF2eGNmcW1mZzFqNWJhOGs2bmcxZm9scHN4a21ka2ttanhrdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vZFZFVYQvtdidWZltF/giphy.gif',
  },
  {
    id: 'recipe',
    title: 'Prompt Recipe Builder',
    description: 'Assemble prompt ingredients by dragging cards into bowls.',
    path: '/games/recipe',
    meme:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3h3cTR0cmEybWt0ZGM2Ymx0ZHB4ZjltbmR2dG55M3Y0MWh6dnRjZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ll22OhMLAlVDbDS3Mo/giphy.gif',
  },
  {
    id: 'darts',
    title: 'Prompt Darts',
    description: 'Aim for clarity by picking the better prompt.',
    path: '/games/darts',
    meme:
      'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW0xZHBmOTl3bWo3bmx6NDNmcjBkamo2a3prd242NjVmZzJvOTlkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SvhOn6vnGXp0BiqlEc/giphy.gif',
  },
]

export default COURSES
