import { useState } from 'react'
import Link from 'next/link'
import Tooltip from '../ui/Tooltip'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0 }} aria-label="Main navigation">
      <div className="brand">
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="brand-logo"
        />
        StrawberryTech
      </div>
      <Tooltip message="Improve readability">
        <ThemeToggle />
      </Tooltip>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>
      <ul className={open ? 'open' : undefined} onClick={() => setOpen(false)}>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/">Home</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/games/tone">Tone</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/games/quiz">Hallucinations</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">

            <Link href="/games/escape">Escape Room</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">

            <Link href="/games/recipe">Prompt Builder</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/games/darts">Prompt Darts</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/games/compose">Compose Tweet</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/leaderboard">Progress</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/badges">Badges</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/community">Community</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/playlist">Playlist</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/help">Help</Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/profile">Profile</Link>
          </Tooltip>
        </li>
      </ul>
    </nav>
  )
}
