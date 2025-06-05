export interface UserData {
  /** User's name for personalized greetings */
  name: string | null
  age: number | null
  scores: Record<string, number>
  badges: string[]
}

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
   * Set the score for a specific game. Implementations typically
   * store the best/highest score seen so far.
   */
  setScore: (game: string, score: number) => void
  /**
   * Award a badge when the player reaches a milestone.
   */
  addBadge: (badge: string) => void
}
