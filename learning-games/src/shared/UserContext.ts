import { createContext } from 'react'
import type { UserData, UserContextType } from '../../../shared/types/user'

export const defaultUser: UserData = {
  id: '',
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
