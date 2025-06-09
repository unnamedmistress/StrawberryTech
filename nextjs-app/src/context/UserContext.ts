import { createContext } from 'react'
import type { UserData, UserContextType } from '../types/user'

export const defaultUser: UserData = {
  name: null,
  age: null,
  difficulty: 'medium',
  points: {},
  badges: [],
}

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  setAge: () => {},
  setName: () => {},
  setPoints: () => {},
  addBadge: () => {},
  setDifficulty: () => {},
})
