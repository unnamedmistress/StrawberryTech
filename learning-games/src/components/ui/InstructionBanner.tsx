import { useState } from 'react'
import './InstructionBanner.css'

export interface InstructionBannerProps {
  children: React.ReactNode
}

export default function InstructionBanner({ children }: InstructionBannerProps) {
<<<<<<< HEAD
  const [visible] = useState(true)
  if (!visible) return null
  return (
    <div className="instruction-banner">
=======
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="instruction-banner">
      <button
        className="banner-close"
        aria-label="Close instructions"
        onClick={() => setVisible(false)}
      >
        X
      </button>
>>>>>>> 222aa0bd194a0c534062972b6c9e522f149ef60b
      <div className="instruction-content">{children}</div>
    </div>
  )
}
