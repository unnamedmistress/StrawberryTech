import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import NotificationModal from '../components/ui/NotificationModal'
import { setNotificationHandler } from '../shared/notify'

interface NotificationContextType {
  showNotification: (message: string, options?: NotificationOptions) => void
}

interface NotificationOptions {
  autoClose?: boolean
  autoCloseDelay?: number
}

interface NotificationState {
  message: string
  isOpen: boolean
  autoClose: boolean
  autoCloseDelay: number
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
    autoClose: true,
    autoCloseDelay: 3000,
  })

  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    setNotification({
      message,
      isOpen: true,
      autoClose: options.autoClose ?? true,
      autoCloseDelay: options.autoCloseDelay ?? 3000,
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
      <NotificationModal
        message={notification.message}
        isOpen={notification.isOpen}
        onClose={closeNotification}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
      />
    </NotificationContext.Provider>
  )
}
