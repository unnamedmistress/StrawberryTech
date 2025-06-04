import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserData, UserContextType } from '../types/user'

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
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser)

  // Helper to set only the age field without overwriting other user data
  const setAge = (age: number) => {
    setUser((prev) => ({ ...prev, age }))
  }

  const setName = (name: string) => {
    setUser((prev) => ({ ...prev, name }))
  }

  return (
    <UserContext.Provider value={{ user, setUser, setAge, setName }}>
      {children}
    </UserContext.Provider>
  )
}
