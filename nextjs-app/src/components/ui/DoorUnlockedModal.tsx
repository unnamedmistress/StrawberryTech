import { useEffect } from 'react'
import styles from './DoorUnlockedModal.module.css'

export interface DoorUnlockedModalProps {
  points: number
  remaining: number
  onNext: () => void
}

export default function DoorUnlockedModal({ points, remaining, onNext }: DoorUnlockedModalProps) {
  useEffect(() => {
    const id = setTimeout(onNext, 3000)
    return () => clearTimeout(id)
  }, [onNext])

  return (
    <div className={styles['door-unlocked-overlay']} role="dialog" aria-modal="true">
      <div className={styles['door-unlocked-modal']}>
        <h3>Door Unlocked!</h3>
        <p className={styles['modal-points']}>+{points} points</p>
        <p className={styles['modal-remaining']}>{remaining} doors remaining</p>
        <button className="btn-primary" onClick={onNext}>
          Next Challenge
        </button>
      </div>
    </div>
  )
}
