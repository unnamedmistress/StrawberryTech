import React from 'react'
import styles from './GamePageLayout.module.css'

interface GamePageLayoutProps {
  imageSrc: string
  imageAlt: string
  infoCardContent: React.ReactNode
  instructions: string
  children: React.ReactNode
  onCTAClick: () => void
  ctaText: string
}

const GamePageLayout: React.FC<GamePageLayoutProps> = ({
  imageSrc,
  imageAlt,
  infoCardContent,
  instructions,
  children,
  onCTAClick,
  ctaText,
}) => {
  return (
    <div id="main-content" className={styles['game-page-container']}>
      <aside className={styles['left-column']}>
        <div className={styles['info-card']}>
          <img src={imageSrc} alt={imageAlt} className={styles['game-image']} />
          {infoCardContent}
        </div>
      </aside>
      <main className={styles['right-column']}>
        <div className={styles['instructions-box']}>{instructions}</div>
        <div className={styles['game-interaction']}>{children}</div>
        <button className={styles['cta-button']} onClick={onCTAClick}>
          {ctaText}
        </button>
      </main>
    </div>
  )
}

export default GamePageLayout
