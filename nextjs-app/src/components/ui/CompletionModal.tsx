import Link from 'next/link'
import BaseModal from '../../../../shared/components/BaseModal'
import styles from './CompletionModal.module.css'

export interface CompletionModalProps {
  imageSrc: string
  buttonHref: string
  buttonLabel: string
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export default function CompletionModal({
  imageSrc,
  buttonHref,
  buttonLabel,
  children,
  isOpen = true,
  onClose = () => {},
}: CompletionModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName={styles['completion-overlay']}
      className={styles['completion-modal']}
    >
      <img src={imageSrc} alt="Completion image" className={styles['completion-img']} />
      {children}
      <Link href={buttonHref} className="btn-primary" style={{ display: 'block', marginTop: '0.5rem' }}>
        {buttonLabel}
      </Link>
      <a
        className={styles['coffee-link']}
        href="https://coff.ee/strawberrytech"
        target="_blank"
        rel="noopener noreferrer"
      >
        ☕ Buy me a coffee
      </a>
    </BaseModal>
  )
}
