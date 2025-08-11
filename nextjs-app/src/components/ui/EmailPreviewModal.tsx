import BaseModal from '../../../../shared/components/BaseModal'
import styles from './EmailPreviewModal.module.css'

export interface EmailPreviewModalProps {
  emailText: string
  onClose: () => void
  isOpen?: boolean
}

export default function EmailPreviewModal({ emailText, onClose, isOpen = true }: EmailPreviewModalProps) {
  const lines = emailText.split('\n')
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName={styles['preview-overlay']}
      className={styles['preview-modal']}
    >
      <div className={styles['email-text']}>
        {lines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
      <button className="btn-primary" onClick={onClose} style={{ marginTop: '0.5rem' }}>
        OK
      </button>
    </BaseModal>
  )
}
