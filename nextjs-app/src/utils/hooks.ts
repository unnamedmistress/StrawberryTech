import { useEffect, RefObject } from 'react'

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}

/**
 * Hook for handling keyboard navigation in dropdowns
 */
export function useKeyboardNavigation(
  isOpen: boolean,
  onClose: () => void,
  itemCount: number = 0
) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'Tab':
          // Allow natural tab navigation
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, itemCount])
}
