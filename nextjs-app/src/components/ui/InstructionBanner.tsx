import { useState } from 'react'
import './InstructionBanner.css'

export interface InstructionBannerProps {
  children: React.ReactNode
}

export default function InstructionBanner({ children }: InstructionBannerProps) {
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
      <div className="instruction-content">{children}</div>
    </div>
  )
}
