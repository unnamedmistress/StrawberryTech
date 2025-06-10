import styles from './ProgressBar.module.css'

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className={styles['progress-bar']} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className={styles['progress-bar-fill']} style={{ width: `${percent}%` }} />
    </div>
  )
}
