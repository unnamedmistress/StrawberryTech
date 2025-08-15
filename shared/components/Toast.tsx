import { useEffect } from 'react'

export interface ToastProps {
  message: string
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(onClose, duration)
      return () => clearTimeout(id)
    }
  }, [isOpen, duration, onClose])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: '#333',
        color: '#fff',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  )
}
