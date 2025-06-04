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
      {/* greeting */}
      {user.age && <h2>Welcome! Age group: {user.age}</h2>}

      {/* game list */}
      <div className="game-grid">
        <Link className="game-card" to="/games/match3">Match-3 Puzzle</Link>
        <Link className="game-card" to="/games/quiz">Quiz Game</Link>
        <Link className="game-card" to="/games/dragdrop">Drag & Drop Game</Link>
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
