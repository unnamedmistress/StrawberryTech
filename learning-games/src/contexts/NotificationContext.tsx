import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import NotificationToast from '../components/ui/NotificationToast'

import { setNotificationHandler } from '../shared/notify'

interface NotificationContextType {
  showNotification: (message: string, options?: NotificationOptions) => void
}

interface NotificationOptions {
  duration?: number
}

interface NotificationState {
  message: string
  isOpen: boolean
  duration: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    isOpen: false,
    duration: 3000,
  })

  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    setNotification({
      message,
      isOpen: true,
      duration: options.duration ?? 3000,
    })
  }, [])
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Connect the global notify function to this context
  useEffect(() => {
    setNotificationHandler(showNotification)
  }, [showNotification])

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <NotificationToast
        message={notification.message}
        isOpen={notification.isOpen}
        onClose={closeNotification}
        autoCloseDelay={notification.duration}
      />
    </NotificationContext.Provider>
  )
}
