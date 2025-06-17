import { useContext } from 'react'
import HeadTag from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import { getTotalPoints } from '../utils/user'
import styles from '../styles/Home.module.css'

/**
 * Clean and Simple Home Page
 * Focused on clear call-to-action and easy game access
 */
export default function Home() {
  const { user } = useContext(UserContext) as UserContextType
  const router = useRouter()
  const totalPoints = getTotalPoints(user.points)

  // Core games that teach AI prompting skills through interactive challenges
  const games = [
    {
      id: 'intro',
      title: 'AI Basics',
      description: 'Discover how AI predicts the next word',
      icon: '🤖',
      path: '/games/intro'
    },
    {
      id: 'tone',
      title: 'Tone',
      description: 'Master prompt tone and style through audio recognition',
      icon: '🎵',
      path: '/games/tone'
    },
    {
      id: 'guess',
      title: 'Hallucination',
      description: 'Learn to identify AI hallucinations and fact-check responses',
      icon: '🔍',
      path: '/games/guess'
    },
    {
      id: 'escape',
      title: 'Escape Game Puzzle',
      description: 'Solve complex prompting challenges to escape each room',
      icon: '🚪',
      path: '/games/escape'
    }
  ]
  return (
    <>
      <HeadTag>
        <title>StrawberryTech Learning Games</title>
        <meta property="og:title" content="StrawberryTech Learning Games" />
        <meta
          property="og:description"
          content="Play engaging games and sharpen your skills in our fruity learning arcade."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        />
        <meta
          property="og:url"
          content="https://strawberry-tech.vercel.app/"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="StrawberryTech Learning Games" />
        <meta
          name="twitter:description"
          content="Play engaging games and sharpen your skills in our fruity learning arcade."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        />
        <meta
          name="twitter:url"
          content="https://strawberry-tech.vercel.app/"
        />
      </HeadTag>
      
      <div id="main-content" className={styles.home}>        {/* Modern Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>StrawberryTech</h1>
              <p className={styles.subtitle}>
                Master AI prompting through engaging, interactive games
              </p>
              <p className={styles.description}>
                Learn the art and science of AI prompting with our carefully designed mini-games. 
                Each challenge teaches you essential skills for crafting effective prompts, 
                identifying AI limitations, and maximizing AI collaboration.
              </p>
              
              {/* Call to Action */}
              <div className={styles.ctaContainer}>
                <button
                  className={styles.ctaButton}
                  onClick={() => router.push('/games/intro')}
                >
                  Start Learning Prompting
                </button>
                <p className={styles.ctaHint}>Begin with an AI intro</p>
              </div>
            </div>
            
            <div className={styles.heroVisual}>
              <img
                src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
                alt="StrawberryTech mascot"
                className={styles.logo}
                width="140"
                height="140"
              />
            </div>
          </div>
        </header>        {/* Games Section */}
        <section className={styles.gamesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Prompting Skills Training</h2>
            <p className={styles.sectionSubtitle}>
              Three core games designed to teach you the fundamentals of effective AI prompting
            </p>
          </div>
          
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <button
                key={game.id}
                className={styles.gameCard}
                onClick={() => router.push(game.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.gameIcon}>{game.icon}</div>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <p className={styles.gameDescription}>{game.description}</p>
                <div className={styles.gameArrow}>→</div>
              </button>
            ))}
          </div>
        </section>        {/* Refined Progress Section */}
        {totalPoints > 0 && (
          <section className={styles.progressSection}>
            <div className={styles.progressCard}>
              <div className={styles.progressContent}>
                <span className={styles.progressIcon}>🏆</span>
                <div className={styles.progressInfo}>
                  <div className={styles.progressPoints}>{totalPoints}</div>
                  <div className={styles.progressLabel}>Points Earned</div>
                </div>
              </div>
              <div className={styles.progressMessage}>
                You're making excellent progress!
              </div>
            </div>
          </section>
        )}

        {/* Elegant Footer Navigation */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.quickLinks}>
              <Link href="/community" className={styles.link}>
                <span className={styles.linkIcon}>👥</span>
                <span className={styles.linkLabel}>Community</span>
              </Link>
              <Link href="/badges" className={styles.link}>
                <span className={styles.linkIcon}>🏅</span>
                <span className={styles.linkLabel}>Achievements</span>
              </Link>
              <Link href="/prompt-library" className={styles.link}>
                <span className={styles.linkIcon}>📚</span>
                <span className={styles.linkLabel}>Resources</span>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export function Head() {
  return (
    <>
      <title>StrawberryTech Games</title>
      <meta
        name="description"
        content="Explore mini games that teach AI prompting techniques."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
