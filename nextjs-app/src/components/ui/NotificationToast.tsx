import { useEffect } from 'react'
import styles from './NotificationToast.module.css'

export interface NotificationToastProps {
  message: string
  isOpen: boolean
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function NotificationToast({
  message,
  isOpen,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}: NotificationToastProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles['notification-toast']} role="alert" aria-live="assertive">
      <div className={styles['notification-message']}>{message}</div>
      <button
        className={styles['notification-close']}
        onClick={onClose}
        aria-label="Close notification"
        type="button"
      >
        ✕
      </button>
      {autoClose && (
        <div className={styles['notification-progress']}>
          <div
            className={styles['notification-progress-bar']}
            style={{ animationDuration: `${autoCloseDelay}ms` }}
          />
        </div>
      )}
    </div>
  )
}