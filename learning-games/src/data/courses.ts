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
    id: 'tone',
    title: 'Tone Puzzle',
    description: 'Swap adjectives to explore how tone changes a message.',
    path: '/games/tone',
    meme: 'https://i.imgflip.com/1bhf.jpg',
  },
  {
    id: 'quiz',
    title: 'Hallucinations Quiz',
    description: 'Spot the AI hallucination hidden among the facts.',
    path: '/games/quiz',
    meme: 'https://i.imgflip.com/30b1gx.jpg',
  },
]

export default COURSES
