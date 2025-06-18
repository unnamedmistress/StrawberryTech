export interface UserData {
  /** Unique ID for server tracking */
  id: string
  /** User's name for personalized greetings */
  name: string | null
  age: number | null
  /** Player selected difficulty level */
  difficulty: 'easy' | 'medium' | 'hard'
  points: Record<string, number>
  badges: string[]
}

export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior'

export interface UserContextType {
  user: UserData
  setUser: (user: UserData) => void
  /**
   * Update only the age field of the user. Games read this to tailor
   * content difficulty and themes.
   */
  setAge: (age: number) => void
  /**
   * Update only the name field of the user.
   */
  setName: (name: string) => void
  /**
   * Record points for a specific game. Implementations typically
   * store the best/highest points seen so far.
   */
  setPoints: (game: string, points: number) => void
  /**
   * Award a badge when the player reaches a milestone.
   */
  addBadge: (badge: string) => void
  /**
   * Update the difficulty setting for all games.
   */
  setDifficulty: (level: 'easy' | 'medium' | 'hard') => void
  /**
   * Age group derived from the user's age. Used to tailor AI responses.
   */
  ageGroup: AgeGroup
}
