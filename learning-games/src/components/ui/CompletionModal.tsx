import { Link } from 'react-router-dom'
import './CompletionModal.css'

export interface CompletionModalProps {
  imageSrc: string
  buttonHref: string
  buttonLabel: string
  children?: React.ReactNode
}

export default function CompletionModal({
  imageSrc,
  buttonHref,
  buttonLabel,
  children,
}: CompletionModalProps) {
  return (
    <div className="completion-overlay">
      <div className="completion-modal" role="dialog" aria-modal="true">
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
      </div>
    </div>
  )
}
