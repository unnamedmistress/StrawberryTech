import { motion } from 'framer-motion'
import Tooltip from './Tooltip'
import './InfoButton.css'

export interface InfoButtonProps {
  message: string
}

export default function InfoButton({ message }: InfoButtonProps) {
  return (
    <Tooltip message={message}>
      <motion.button
        className="info-button"
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6 }}
        aria-label="Game instructions"
      >
        ℹ️
      </motion.button>
    </Tooltip>
  )
}

