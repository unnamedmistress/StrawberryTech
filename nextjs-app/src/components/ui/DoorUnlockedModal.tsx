import { useEffect } from 'react'
import './DoorUnlockedModal.css'

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
    <div className="door-unlocked-overlay" role="dialog" aria-modal="true">
      <div className="door-unlocked-modal">
        <h3>Door Unlocked!</h3>
        <p className="modal-points">+{points} points</p>
        <p className="modal-remaining">{remaining} doors remaining</p>
        <button className="btn-primary" onClick={onNext}>
          Next Challenge
        </button>
      </div>
    </div>
  )
}
