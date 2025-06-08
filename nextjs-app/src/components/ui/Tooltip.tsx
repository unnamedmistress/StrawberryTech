import { useState } from 'react'
import './Tooltip.css'

export interface TooltipProps {
  message: string
  children: React.ReactNode
}

export default function Tooltip({ message, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && <span className="tooltip">{message}</span>}
    </span>
  )
}
