import { createContext } from 'react'
import type { UserData, UserContextType, AgeGroup } from '../../../shared/types/user'
import { getAgeGroup } from '../../../shared/getAgeGroup'

export const defaultUser: UserData = {
  id: '',
  name: null,
  age: null,
  difficulty: 'medium',
  points: {},
  badges: [],
}

const defaultAgeGroup: AgeGroup = getAgeGroup(null)

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  setAge: () => {},
  setName: () => {},
  setPoints: () => {},
  addBadge: () => {},
  setDifficulty: () => {},
  ageGroup: defaultAgeGroup,
})
