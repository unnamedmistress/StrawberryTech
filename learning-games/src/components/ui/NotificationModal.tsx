import { useEffect } from 'react'
import styles from './NotificationModal.module.css'

export interface NotificationModalProps {
  message: string
  isOpen: boolean
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function NotificationModal({
  message,
  isOpen,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}: NotificationModalProps) {
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
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className={styles['notification-overlay']}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-message"
    >
      <div className={styles['notification-modal']}>
        <div
          id="notification-message"
          className={styles['notification-message']}
          role="alert"
          aria-live="assertive"
        >
          {message}
        </div>
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
    </div>
  )
}
