import { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

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

  const totalPoints = Object.values(user.scores).reduce((a, b) => a + b, 0)

  return (
    <div className="home">
      {/* hero section */}
      <section className="hero">
        <h1>Fun Learning Awaits!</h1>
        <p className="tagline">Play engaging games and sharpen your skills.</p>
        <button onClick={() => navigate('/games/match3')}>Play Now</button>
      </section>

      {/* greeting */}
      {user.age && (
        <h2>
          Welcome{user.name ? `, ${user.name}` : ''}! Age group: {user.age}
        </h2>
      )}

      {/* game list */}
      <div className="game-grid">
        <Link className="game-card" to="/games/match3">
          <span className="game-icon">🧩</span>
          <span>Match-3 Puzzle</span>
        </Link>
        <Link className="game-card" to="/games/quiz">
          <span className="game-icon">❓</span>
          <span>Quiz Game</span>
        </Link>
        <Link className="game-card" to="/games/dragdrop">
          <span className="game-icon">🎯</span>
          <span>Drag & Drop Game</span>
        </Link>
      </div>

      {/* navigation */}
      <p>
        <Link to="/leaderboard">View Leaderboard</Link>
      </p>

      {/* progress summary */}
      {totalPoints > 0 && (
        <div className="progress-summary">
          <p>Total Points: {totalPoints}</p>
          <p>Badges Earned: {user.badges.length}</p>
        </div>
      )}
    </div>
  )
}
