import React from 'react'
import './ProgressBar.css'

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
