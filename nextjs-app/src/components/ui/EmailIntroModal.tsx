import styles from './EmailIntroModal.module.css'

export default function EmailIntroModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles['intro-overlay']} role="dialog" aria-modal="true">
      <div className={styles['intro-modal']}>
        <h2>Welcome to the AI-Powered Email Builder!</h2>
        <p>AI predicts the most likely next words to help craft polished emails.</p>
        <ul>
          <li>Select the type of email you want to write.</li>
          <li>Pick from polite openings and helpful body sentences.</li>
          <li>Earn points for professional choices and unlock badges.</li>
        </ul>
        <button className="btn-primary" onClick={onClose}>Start Building</button>
      </div>
    </div>
  )
}
