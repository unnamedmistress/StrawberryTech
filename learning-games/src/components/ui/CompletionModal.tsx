import { Link } from 'react-router-dom'
import BaseModal from '../../../../shared/components/BaseModal'
import './CompletionModal.css'

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
      overlayClassName="completion-overlay"
      className="completion-modal"
    >
      <img src={imageSrc} alt="Completion image" className="completion-img" />
      {children}
      <Link to={buttonHref} className="btn-primary" style={{ display: 'block', marginTop: '0.5rem' }}>
        {buttonLabel}
      </Link>
      <a
        className="coffee-link"
        href="https://coff.ee/strawberrytech"
        target="_blank"
        rel="noopener noreferrer"
      >
        ☕ Buy me a coffee
      </a>
    </BaseModal>
  )
}
