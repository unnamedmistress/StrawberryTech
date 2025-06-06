import { useState } from 'react'
import './InstructionBanner.css'

export interface InstructionBannerProps {
  children: React.ReactNode
}

export default function InstructionBanner({ children }: InstructionBannerProps) {
  const [visible] = useState(true)
  if (!visible) return null
  return (
    <div className="instruction-banner">
      <div className="instruction-content">{children}</div>
    </div>
  )
}
