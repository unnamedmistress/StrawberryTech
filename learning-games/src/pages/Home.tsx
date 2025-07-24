import { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import { getTotalPoints } from '../utils/user'
import './Home.css'
import { GOAL_POINTS } from '../constants/progress'
import ProgressSummary from '../components/ProgressSummary'
import AdventureProgress from '../components/ui/AdventureProgress'
import { ADVENTURE_GAMES, getAdventureStep } from '../utils/adventure'

/**
 * Home page listing available games.
 * If the user's age isn't known we send them to the age input form first.
 */
export default function Home() {
  const { user } = useContext(UserContext) as UserContextType
  const navigate = useNavigate()
  const step = getAdventureStep(user.points)
  const nextGame = ADVENTURE_GAMES[step]

  // Redirect to the age form if age hasn't been provided yet
  // Temporarily disabled so the home page loads without requiring age
  /*
  useEffect(() => {
    if (user.age === null) {
      navigate('/age')
    }
  }, [user.age, navigate])
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
    <div id="main-content" className="home">
      {/* hero section */}
      <section className="hero reveal" aria-label="Homepage hero">
        <h1 className="hero-title">Embark on a Fruity Learning Adventure!</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="hero-img"
        />
        <p className="tagline">Play engaging games and sharpen your skills.</p>

        {nextGame && (
          <button
            onClick={() => navigate(nextGame.path)}
            className="btn-primary"
            aria-label="Play next game"
          >
            Play
          </button>
        )}
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

      <AdventureProgress step={step} />


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
        {ADVENTURE_GAMES.map((g, idx) => (
          <Link
            key={g.key}
            className={`game-card${idx > step ? ' locked' : ''}`}
            to={g.path}
          >
            <img
              src={
                g.key === 'tone'
                  ? 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTexbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif'
                  : g.key === 'quiz'
                  ? 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTZoaHpxY3AwbmN1OTMwN3dkY3c5eXI1eXB3cDJ5ajNudDdkcnJ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/SR6WK6jz0rRWf2QK0t/giphy.gif'
                  : g.key === 'recipe'
                  ? 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3h3cTR0cmEybWt0ZGM2Ymx0ZHB4ZjltbmR2dG55M3Y0MWh6dnRjZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ll22OhMLAlVDbDS3Mo/giphy.gif'
                  : 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGxwaGF2eGNmcW1mZzFqNWJhOGs2bmcxZm9scHN4a21ka2ttanhrdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vZFZFVYQvtdidWZltF/giphy.gif'
              }
              alt={`${g.title} preview`}
              className="game-icon"
            />
            <span className="game-title">{g.title}</span>
          </Link>
        ))}
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
