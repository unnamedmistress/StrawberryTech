import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="brand">StrawberryTech</div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/games/match3">Match-3</Link></li>
        <li><Link to="/games/quiz">Quiz</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
      </ul>
    </nav>
  )
}
