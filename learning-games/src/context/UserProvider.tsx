import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { ReactNode } from 'react'
import type { UserData } from '../types/user'
import { UserContext, defaultUser } from './UserContext'

// All progress is stored under this key in localStorage so it persists across
// sessions. Whenever the user object changes we throttle a save to this key.
const STORAGE_KEY = 'strawberrytech_user'


export function UserProvider({ children }: { children: ReactNode }) {
  // Load any saved user progress from localStorage on first render
  const [user, setUser] = useState<UserData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return { ...defaultUser, ...JSON.parse(saved) }
        } catch (err) {
          console.error('Failed to parse saved user data', err)
        }
      }
    }
    return defaultUser
  })

  // Load any saved data from the server and merge it with local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/user`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser((prev) => ({ ...prev, ...data }))
        })
        .catch((err) => console.error('Failed to fetch user data', err))
    }
  }, [])


  // Helper to set only the age field without overwriting other user data.
  const setAge = useCallback((age: number) => {
    setUser((prev) => ({ ...prev, age }))
  }, [])

  const setName = useCallback((name: string) => {
    setUser((prev) => ({ ...prev, name }))
  }, [])

  const setDifficulty = useCallback((level: 'easy' | 'medium' | 'hard') => {
    setUser(prev => ({ ...prev, difficulty: level }))
  }, [])

  // Record the best points for a specific game
  const setPoints = useCallback(
    (game: string, points: number) => {
      setUser(prev => {
        const prevBest = prev.points[game] ?? 0
        const nextBest = Math.max(points, prevBest)
        if (nextBest > prevBest) {
          toast.success(`New high points in ${game}: ${nextBest}`)
        }
        return {
          ...prev,
          points: {
            ...prev.points,
            [game]: nextBest,
          },
        }
      })
      if (typeof window !== 'undefined') {
        const base = window.location.origin
        fetch(`${base}/api/scores/${game}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.name ?? 'Anonymous', score: points }),
        }).catch(err => console.error('Failed to save score', err))
      }
    },
    [user.name],
  )

  // Award a badge for achievements or milestones
  const addBadge = useCallback((badge: string) => {
    setUser(prev => {
      if (!prev.badges.includes(badge)) {
        toast.success(`Badge unlocked: ${badge}`)
        return { ...prev, badges: [...prev.badges, badge] }
      }
      return prev
    })
  }, [])

  // Persist user progress to localStorage whenever it changes. The timeout acts
  // like a simple debounce so rapid state updates don't spam localStorage.
  useEffect(() => {
    const handle = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      if (typeof window !== 'undefined') {
        const base = window.location.origin
        fetch(`${base}/api/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.name,
            age: user.age,
            badges: user.badges,
            scores: user.points,
            difficulty: user.difficulty,
          }),
        }).catch((err) => console.error('Failed to save user', err))
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [user])

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        setAge,
        setName,
        setPoints,
        addBadge,
        setDifficulty,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
