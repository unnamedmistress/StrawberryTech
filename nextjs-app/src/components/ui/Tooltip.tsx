import { useState } from 'react'
import styles from './Tooltip.module.css'

export interface TooltipProps {
  message: string
  children: React.ReactNode
}

export default function Tooltip({ message, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className={styles['tooltip-wrapper']}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && <span className={styles.tooltip}>{message}</span>}
    </span>
  )
}
