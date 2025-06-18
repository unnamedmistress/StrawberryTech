import { useState, useCallback, useEffect } from 'react'
import { notify } from './notify'
import type { ReactNode } from 'react'
import type { UserData } from './types/user'
import { UserContext, defaultUser } from './UserContext'
import { getApiBase } from '../../../shared/getApiBase'
import { getAgeGroup } from '../../../shared/getAgeGroup'

const STORAGE_KEY = 'strawberrytech_user'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(() => {
    // Always start with default user to prevent hydration mismatch
    return { ...defaultUser, id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) }
  })
  // Load from localStorage after mount to prevent hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = { ...defaultUser, ...JSON.parse(saved) }
          if (!parsed.id) {
            parsed.id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2))
          }
          setUser(parsed)
        } catch (err) {
          console.error('Failed to parse saved user data', err)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/user`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data)
            setUser((prev) => ({
              ...prev,
              ...data,
              id: prev.id || data.id || prev.id,
            }))
        })
        .catch((err) => console.error('Failed to fetch user data', err))
    }
  }, [])

  const setAge = useCallback((age: number) => {
    setUser((prev) => ({ ...prev, age }))
  }, [])

  const setName = useCallback((name: string) => {
    setUser((prev) => ({ ...prev, name }))
  }, [])

  const setDifficulty = useCallback((level: 'easy' | 'medium' | 'hard') => {
    setUser(prev => ({ ...prev, difficulty: level }))
  }, [])

  const setPoints = useCallback(
    (game: string, points: number) => {
      setUser(prev => {
        const prevBest = prev.points[game] ?? 0
        const nextBest = Math.max(points, prevBest)
        if (nextBest > prevBest) {
          notify(`New high points in ${game}: ${nextBest}`)
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
        const base = getApiBase()
        fetch(`${base}/api/scores/${game}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            name: user.name ?? 'Anonymous',
            score: points,
          }),
        }).catch(err => console.error('Failed to save score', err))
      }
    },
    [user.name],
  )

  const addBadge = useCallback((badge: string) => {
    setUser(prev => {
      if (!prev.badges.includes(badge)) {
        notify(`Badge unlocked: ${badge}`)
        return { ...prev, badges: [...prev.badges, badge] }
      }
      return prev
    })
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      if (typeof window !== 'undefined') {
        const base = getApiBase()
        fetch(`${base}/api/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
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
        ageGroup: getAgeGroup(user.age),
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
