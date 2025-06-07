import { motion } from 'framer-motion'
import './DoorAnimation.css'

export interface DoorAnimationProps {
  openPercent: number
}

export default function DoorAnimation({ openPercent }: DoorAnimationProps) {
  const percent = Math.max(0, Math.min(100, openPercent))
  return (
    <div className="door-container">
      <motion.div
        className="door-half left"
        animate={{ x: `-${percent}%` }}
        transition={{ type: 'tween', duration: 0.5 }}
      />
      <motion.div
        className="door-half right"
        animate={{ x: `${percent}%` }}
        transition={{ type: 'tween', duration: 0.5 }}
      />
    </div>
  )
}
