import React from 'react'
import ProgressSidebar from './ProgressSidebar'
import styles from './ModernGameLayout.module.css'

export interface ModernGameLayoutProps {
  children: React.ReactNode
  whyCard: React.ReactNode
  className?: string
  gameTitle: string
  gameIcon?: string
  showProgressSidebar?: boolean
  nextGameButton?: React.ReactNode
  instructions?: React.ReactNode
}

/**
 * Modern unified game layout that replaces the old instruction banner pattern
 * with a cohesive, structured design suitable for all ages and screen sizes
 */
export default function ModernGameLayout({
  children,
  whyCard,
  className = '',
  gameTitle,
  gameIcon,
  showProgressSidebar = false,
  nextGameButton,
  instructions
}: ModernGameLayoutProps) {
  return (
    <div id="main-content" className={`${styles.modernGameLayout} ${className}`}>
      {/* Game Header */}
      <header className={styles.gameHeader}>
        <div className={styles.gameTitleSection}>
          {gameIcon && <img src={gameIcon} alt="" className={styles.gameHeaderIcon} />}
          <h1 className={styles.gameTitle}>{gameTitle}</h1>
        </div>
        {instructions}
      </header>

      {/* Main Game Grid */}
      <div className={styles.gameGrid}>
        {/* Educational Why Card */}
        <section className={styles.whySection}>
          {whyCard}
        </section>

        {/* Game Content Area */}
        <main className={styles.gameContent}>
          {children}
        </main>

        {/* Progress Sidebar */}
        {showProgressSidebar && (
          <aside className={styles.progressSection}>
            <ProgressSidebar />
          </aside>
        )}
      </div>

      {/* Navigation Footer */}
      {nextGameButton && (
        <footer className={styles.gameNavigation}>
          {nextGameButton}
        </footer>
      )}
    </div>
  )
}
