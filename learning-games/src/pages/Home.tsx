import { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { getTotalPoints } from '../utils/user'
import './Home.css'
import { GOAL_POINTS } from '../constants/progress'
import ProgressSummary from '../components/ProgressSummary'

/**
 * Home page listing available games.
 * If the user's age isn't known we send them to the age input form first.
 */
export default function Home() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  // Redirect to the age form if age hasn't been provided yet
  useEffect(() => {
    if (user.age === null) {
      navigate('/age')
    }
  }, [user.age, navigate])

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
    <div className="home">
      {/* hero section */}
      <section className="hero reveal" aria-label="Homepage hero">
        <h1 className="hero-title">Embark on a Fruity Learning Adventure!</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="hero-img"
        />
        <p className="tagline">Play engaging games and sharpen your skills.</p>

        <button onClick={() => navigate('/games/tone')} className="btn-primary" aria-label="Play Tone Puzzle">

          Play Now
        </button>
        <button
          onClick={() => navigate('/community')}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
          aria-label="Visit community forum"
        >
          Community
        </button>
        <button
          onClick={() => navigate('/playlist')}
          className="btn-primary"
          style={{ marginLeft: '1rem' }}
          aria-label="See prompt playlist"
        >
          Playlist
        </button>
      </section>


      {/* greeting - temporarily disabled per UX review */}
      {/**
      {user.age && (
        <h2 className="reveal">
          Welcome{user.name ? `, ${user.name}` : ''}! Age group: {user.age}
        </h2>
      )}
      */}

      {/* game list */}
      <div className="game-grid reveal">
        <Link className="game-card" to="/games/tone">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTExbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif"
            alt="Tone puzzle preview"
            className="game-icon"
          />
          <span className="game-title">Tone Puzzle</span>
        </Link>
        <Link className="game-card" to="/games/quiz">
          <img
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTZoaHpxY3AwbmN1OTMwN3dkY3c5eXI1eXB3cDJ5ajNudDdkcnJ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/SR6WK6jz0rRWf2QK0t/giphy.gif"
            alt="Hallucinations preview"
            className="game-icon"
          />
          <span className="game-title">Hallucinations</span>
        </Link>
        <Link className="game-card" to="/games/escape">
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGxwaGF2eGNmcW1mZzFqNWJhOGs2bmcxZm9scHN4a21ka2ttanhrdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vZFZFVYQvtdidWZltF/giphy.gif"
            alt="Escape room preview"
            className="game-icon"
          />
          <span className="game-title">Escape Room</span>
        </Link>
        <Link className="game-card" to="/games/recipe">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3h3cTR0cmEybWt0ZGM2Ymx0ZHB4ZjltbmR2dG55M3Y0MWh6dnRjZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ll22OhMLAlVDbDS3Mo/giphy.gif"
            alt="Prompt recipe preview"

            className="game-icon"
          />
          <span className="game-title">Prompt Builder</span>
        </Link>
        <Link className="game-card" to="/games/darts">
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW0xZHBmOTl3bWo3bmx6NDNmcjBkamo2a3prd242NjVmZzJvOTlkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SvhOn6vnGXp0BiqlEc/giphy.gif"
            alt="Prompt darts preview"
            className="game-icon"
          />
          <span className="game-title">Prompt Darts</span>
        </Link>
      </div>

      {/* navigation */}
      <p className="reveal">
        <Link to="/leaderboard">View Progress</Link>
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
  )
}
