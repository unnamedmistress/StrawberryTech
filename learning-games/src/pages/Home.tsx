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
        <h1>Fun Learning Awaits!</h1>
        <img
          src="https://cdnjs.cloudflare.com/ajax/libs/openmoji/15.1.0/color/svg/1F353.svg"
          alt="Strawberry mascot"
          className="hero-img"
        />
        <p className="tagline">Play engaging games and sharpen your skills.</p>
        <button onClick={() => navigate('/games/match3')}>Play Now</button>
      </section>

      {/* greeting */}
      {user.age && (
        <h2 className="reveal">
          Welcome{user.name ? `, ${user.name}` : ''}! Age group: {user.age}
        </h2>
      )}

      {/* game list */}
      <div className="game-grid reveal">
        <Link className="game-card" to="/games/match3">
          <img
            src="https://cdnjs.cloudflare.com/ajax/libs/openmoji/15.1.0/color/svg/1F9E9.svg"
            alt="Puzzle"
            className="game-icon"
          />
          <span>Match-3 Puzzle</span>
        </Link>
        <Link className="game-card" to="/games/quiz">
          <img
            src="https://cdnjs.cloudflare.com/ajax/libs/openmoji/15.1.0/color/svg/2753.svg"
            alt="Question mark"
            className="game-icon"
          />
          <span>Two Truths and a Lie</span>
        </Link>
      </div>

      {/* navigation */}
      <p className="reveal">
        <Link to="/leaderboard">View Leaderboard</Link>
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
