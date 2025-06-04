import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserData, UserContextType } from '../types/user'

const defaultUser: UserData = {
  age: null,
  scores: {},
  badges: [],
}

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
