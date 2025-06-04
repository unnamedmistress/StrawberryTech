export interface UserData {
  age: number | null
  scores: Record<string, number>
  badges: string[]
}

export interface UserContextType {
  user: UserData
  setUser: (user: UserData) => void
}
