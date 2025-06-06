import { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import './Home.css'

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

  const totalPoints = Object.values(user.scores).reduce((a, b) => a + b, 0)

  return (
    <div className="home">
      {/* hero section */}
      <section className="hero reveal">
        <h1 className="hero-title">Embark on a Fruity Learning Adventure!</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_24_31%20AM.png"
          alt="Strawberry logo"
          className="hero-img"
        />
        <p className="tagline">Play engaging games and sharpen your skills.</p>
        <button onClick={() => navigate('/games/tone')}>Play Now</button>
        <button onClick={() => navigate('/community')} style={{ marginLeft: '1rem' }}>
          Community
        </button>
      </section>


      {/* greeting */}
      {user.age && (
        <h2 className="reveal">
          Welcome{user.name ? `, ${user.name}` : ''}! Age group: {user.age}
        </h2>
      )}

      {/* game list */}
      <div className="game-grid reveal">
        <Link className="game-card" to="/games/tone">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3V3YmcybDA1YTExbGhzcDJ4OXFpNGlnMmlkbWt3dGI2dWRraTh2eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z9EX1jzpulWOyM43uG/giphy.gif"
            alt="Tone puzzle preview"
            className="game-icon"
          />
          <span>Tone Puzzle</span>
        </Link>
        <Link className="game-card" to="/games/quiz">
          <img
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTZoaHpxY3AwbmN1OTMwN3dkY3c5eXI1eXB3cDJ5ajNudDdkcnJ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/SR6WK6jz0rRWf2QK0t/giphy.gif"
            alt="Hallucinations preview"
            className="game-icon"
          />
          <span>Hallucinations</span>
        </Link>
      </div>

      {/* navigation */}
      <p className="reveal">
        <Link to="/leaderboard">View Progress</Link>
      </p>

      {/* progress summary */}
      {totalPoints > 0 && (
        <div className="progress-summary reveal">
          <p>Total Points: {totalPoints}</p>
          <progress value={totalPoints} max={100} />
          <p>Badges Earned: {user.badges.length}</p>
          <div className="badge-icons">
            {user.badges.map((b) => (
              <span key={b}>🏅</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
