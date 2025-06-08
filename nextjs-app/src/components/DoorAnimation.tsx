import { motion } from 'framer-motion'
import './DoorAnimation.css'

export interface DoorAnimationProps {
  openPercent: number
}

export default function DoorAnimation({ openPercent }: DoorAnimationProps) {
  const angle = Math.max(0, Math.min(75, (openPercent / 100) * 75))
  return (
    <div className="door-container">
      <div className="door-frame">
        <motion.div
          className="door"
          animate={{ rotateY: -angle }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.8 }}
        >
          <div className="door-handle" />
        </motion.div>
      </div>
    </div>
  )
}
