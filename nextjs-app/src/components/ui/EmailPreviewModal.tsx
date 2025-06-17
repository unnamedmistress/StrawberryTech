import styles from './EmailPreviewModal.module.css'

export interface EmailPreviewModalProps {
  emailText: string
  onClose: () => void
}

export default function EmailPreviewModal({ emailText, onClose }: EmailPreviewModalProps) {
  const lines = emailText.split('\n')
  return (
    <div className={styles['preview-overlay']} role="dialog" aria-modal="true">
      <div className={styles['preview-modal']}>
        <div className={styles['email-text']}>
          {lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        <button className="btn-primary" onClick={onClose} style={{ marginTop: '0.5rem' }}>
          OK
        </button>
      </div>
    </div>
  )
}
