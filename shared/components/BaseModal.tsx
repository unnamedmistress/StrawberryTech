import { useEffect, useRef } from 'react'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  overlayClassName?: string
  className?: string
  labelledBy?: string
}

export default function BaseModal({
  isOpen,
  onClose,
  children,
  overlayClassName,
  className,
  labelledBy,
}: BaseModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className={overlayClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div ref={dialogRef} className={className}>
        {children}
      </div>
    </div>
  )
}
