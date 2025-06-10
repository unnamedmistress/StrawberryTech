import { useState } from 'react'
import styles from './InstructionBanner.module.css'

export interface InstructionBannerProps {
  children: React.ReactNode
}

export default function InstructionBanner({ children }: InstructionBannerProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className={styles['instruction-banner']}>
      <button
        className={styles['banner-close']}
        aria-label="Close instructions"
        onClick={() => setVisible(false)}
      >
        X
      </button>
      <div className={styles['instruction-content']}>{children}</div>
    </div>
  )
}
