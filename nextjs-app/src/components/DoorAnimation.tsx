import { motion } from 'framer-motion'
import styles from './DoorAnimation.module.css'

export interface DoorAnimationProps {
  openPercent: number
}

export default function DoorAnimation({ openPercent }: DoorAnimationProps) {
  const angle = Math.max(0, Math.min(75, (openPercent / 100) * 75))
  return (
    <div className={styles['door-container']}>
      <div className={styles['door-frame']}>
        <motion.div
          className={styles.door}
          animate={{ rotateY: -angle }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.8 }}
        >
          <div className={styles['door-handle']} />
        </motion.div>
      </div>
    </div>
  )
}
