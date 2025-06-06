import { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import CourseOverview from '../components/CourseOverview'
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
      {/* intro hero */}
      <section className="intro-hero">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTJhMWE2Yjc2Y2I5NmUxNDA2N2Y0Nzg3NDFiODRlOTk0ODE1MTdlNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yrVn0u3qzO9nK/giphy.gif"
          alt="Confetti celebration"
          aria-label="celebratory animation"
          className="intro-gif"
        />
        <button className="start-btn" onClick={() => navigate('/welcome')}>
          Begin Your Journey
        </button>
      </section>
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

      <CourseOverview />

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
            src="https://plus.unsplash.com/premium_photo-1723662084148-2cd2357705ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
            alt="Puzzle pieces"
            className="game-icon"
          />
          <span>Tone Puzzle</span>
        </Link>
        <Link className="game-card" to="/games/quiz">
          <img
            src="https://plus.unsplash.com/premium_photo-1678048604398-f42dda6997bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
            alt="Question mark"
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
