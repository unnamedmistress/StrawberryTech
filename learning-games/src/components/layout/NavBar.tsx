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
          <Link to="/games/quiz">Two Truths and a Lie</Link>
        </li>
        <li>
          <Link to="/leaderboard">Leaderboard</Link>
        </li>
        <li>
          <Link to="/help">Help</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  )
}
