import { useContext, useEffect } from 'react'
import HeadTag from 'next/head'
import Link from 'next/link'; import { useRouter } from 'next/router'
import { UserContext } from '../../../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import { getTotalPoints } from '../utils/user'
import styles from '../styles/Home.module.css'
import { GOAL_POINTS } from '../constants/progress'
import ProgressSummary from '../components/ProgressSummary'

/**
 * Home page listing available games.
 * If the user's age isn't known we send them to the age input form first.
 */
export default function Home() {
  const { user } = useContext(UserContext) as UserContextType
  const router = useRouter()

  // Redirect to the age form if age hasn't been provided yet
  // Temporarily disabled so the home page loads without requiring age
  /*
  useEffect(() => {
    if (user.age === null) {
      router.push('/age')
    }
  }, [user.age, router])
  */

  // Apply reveal animation when elements scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalPoints = getTotalPoints(user.points)

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
      <div className={styles.home}>
      {/* hero section */}
      <section className="hero reveal" aria-label="Homepage hero">
        <h1 className={styles['hero-title']}>Embark on a Fruity Learning Adventure!</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className={styles['hero-img']}
          width="240"
          height="240"
          loading="lazy"
        />
        <p className={styles.tagline}>Play engaging games and sharpen your skills.</p>

        <div className="hero-actions">
          <button
            onClick={() => router.push('/games/tone')}
            className="btn-primary"
            aria-label="Play Tone Puzzle"
          >
            Play Now
          </button>
          <button
            onClick={() => router.push('/community')}
            className="btn-primary"
            aria-label="View community feedback"
          >
            Community
          </button>
          <button
            onClick={() => router.push('/prompt-library')}
            className="btn-primary"
            aria-label="Browse prompt library"
          >
            Prompt Library
          </button>
        </div>
      </section>


      {/* greeting - temporarily disabled per UX review */}
      {/**
      {user.age && (
        <h2 className="reveal">
          Welcome{user.name ? `, ${user.name}` : ''}! Age group: {user.age}
        </h2>
      )}      */}      {/* navigation */}
      <p className="reveal">
        <Link href="/community">View Community & Progress</Link>
      </p>

      {/* progress summary */}
      {totalPoints > 0 && (
        <div className="reveal">
          <ProgressSummary
            totalPoints={totalPoints}
            badges={user.badges}
            goalPoints={GOAL_POINTS}
          />
        </div>
      )}
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
