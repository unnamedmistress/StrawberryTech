import { useContext, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UserContext } from '../src/context/UserContext'
import { getTotalPoints } from '../src/utils/user'
import { GOAL_POINTS } from '../src/constants/progress'
import ProgressSummary from '../src/components/ProgressSummary'

export default function HomePage() {
  const { user } = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if (user.age === null) {
      router.push('/age')
    }
  }, [user.age, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const totalPoints = getTotalPoints(user.scores)

  return (
    <div className="home">
      <section className="hero reveal" aria-label="Homepage hero">
        <h1 className="hero-title">Embark on a Fruity Learning Adventure!</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="hero-img"
        />
        <p className="tagline">Play engaging games and sharpen your skills.</p>
        <button onClick={() => router.push('/games/tone')} className="btn-primary" aria-label="Play Tone Puzzle">
          Play Now
        </button>
        <button
          onClick={() => router.push('/community')}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
          aria-label="Visit community forum"
        >
          Community
        </button>
        <button
          onClick={() => router.push('/playlist')}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
          aria-label="See prompt playlist"
        >
          Playlist
        </button>
      </section>

      <div className="game-grid reveal">
        <Link className="game-card" href="/games/tone">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTExbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif"
            alt="Tone puzzle preview"
            className="game-icon"
          />
          <span className="game-title">Tone Puzzle</span>
        </Link>
        <Link className="game-card" href="/games/quiz">
          <img
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTZoaHpxY3AwbmN1OTMwN3dkY3c5eXI1eXB3cDJ5ajNudDdkcnJ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dG/SR6WK6jz0rRWf2QK0t/giphy.gif"
            alt="Hallucinations preview"
            className="game-icon"
          />
          <span className="game-title">Hallucinations</span>
        </Link>
        <Link className="game-card" href="/games/escape">
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGxwaGF2eGNmcW1mZzFqNWJhOGs2bmcxZm9scHN4a21ka2ttanhrdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vZFZFVYQvtdidWZltF/giphy.gif"
            alt="Escape room preview"
            className="game-icon"
          />
          <span className="game-title">Escape Room</span>
        </Link>
        <Link className="game-card" href="/games/recipe">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3h3cTR0cmEybWt0ZGM2Ymx0ZHB4ZjltbmR2dG55M3Y0MWh6dnRjZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ll22OhMLAlVDbDS3Mo/giphy.gif"
            alt="Prompt recipe preview"
            className="game-icon"
          />
          <span className="game-title">Prompt Builder</span>
        </Link>
        <Link className="game-card" href="/games/darts">
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW0xZHBmOTl3bWo3bmx6NDNmcjBkamo2a3prd242NjVmZzJvOTlkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SvhOn6vnGXp0BiqlEc/giphy.gif"
            alt="Prompt darts preview"
            className="game-icon"
          />
          <span className="game-title">Prompt Darts</span>
        </Link>
      </div>

      <p className="reveal">
        <Link href="/leaderboard">View Progress</Link>
      </p>

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
  )
}
