import Link from 'next/link'
import styles from './CompletionModal.module.css'

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
    <div className={styles['completion-overlay']}>
      <div className={styles['completion-modal']} role="dialog" aria-modal="true">
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
      </div>
    </div>
  )
}
