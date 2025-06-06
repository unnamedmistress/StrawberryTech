import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="brand">StrawberryTech</div>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>
      <ul className={open ? 'open' : undefined} onClick={() => setOpen(false)}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/games/match3">Match-3</Link>
        </li>
        <li>
<<<<<<< HEAD
          <Link to="/games/quiz">Quiz</Link>
=======
          <Link to="/games/quiz">Two Truths and a Lie</Link>
>>>>>>> 222aa0bd194a0c534062972b6c9e522f149ef60b
        </li>
        <li>
          <Link to="/leaderboard">Leaderboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  )
}
