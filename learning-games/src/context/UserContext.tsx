import { createContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { UserData, UserContextType } from '../types/user'

// All progress is stored under this key in localStorage so it persists across
// sessions. Whenever the user object changes we throttle a save to this key.
const STORAGE_KEY = 'strawberrytech_user'

const defaultUser: UserData = {
  name: null,
  age: null,
  scores: {},
  badges: [],
}

// UserContext stores the entire profile including age. The age value lets
// games adjust difficulty and content for the appropriate age group.
export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  setAge: () => {},
  setName: () => {},
  setScore: () => {},
  addBadge: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  // Load any saved user progress from localStorage on first render
  const [user, setUser] = useState<UserData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser
  })


  // Helper to set only the age field without overwriting other user data.
  const setAge = useCallback((age: number) => {
    setUser((prev) => ({ ...prev, age }))
  }, [])

  const setName = useCallback((name: string) => {
    setUser((prev) => ({ ...prev, name }))
  }, [])

  // Record the best score for a specific game
  const setScore = useCallback((game: string, score: number) => {
    setUser((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [game]: Math.max(score, prev.scores[game] ?? 0),
      },
    }))
  }, [])

  // Award a badge for achievements or milestones
  const addBadge = useCallback((badge: string) => {
    setUser((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge) ? prev.badges : [...prev.badges, badge],
    }))
  }, [])

  // Persist user progress to localStorage whenever it changes. The timeout acts
  // like a simple debounce so rapid state updates don't spam localStorage.
  useEffect(() => {
    const handle = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }, 300)
    return () => clearTimeout(handle)
  }, [user])

  return (
    <UserContext.Provider
      value={{ user, setUser, setAge, setName, setScore, addBadge }}
    >
      {children}
    </UserContext.Provider>
  )
}
