import { createContext } from 'react'
import type { UserData, UserContextType } from '../types/user'

export const defaultUser: UserData = {
  name: null,
  age: null,
  scores: {},
  badges: [],
}

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  setAge: () => {},
  setName: () => {},
  setScore: () => {},
  addBadge: () => {},
})
