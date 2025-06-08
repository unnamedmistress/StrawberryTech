import React from 'react'
import './GamePageLayout.css'

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
    <div className="game-page-container">
      <aside className="left-column">
        <div className="info-card">
          <img src={imageSrc} alt={imageAlt} className="game-image" />
          {infoCardContent}
        </div>
      </aside>
      <main className="right-column">
        <div className="instructions-box">{instructions}</div>
        <div className="game-interaction">{children}</div>
        <button className="cta-button" onClick={onCTAClick}>
          {ctaText}
        </button>
      </main>
    </div>
  )
}

export default GamePageLayout
