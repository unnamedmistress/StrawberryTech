import { useState, useEffect } from 'react'
import Link from 'next/link'
import Tooltip from '../ui/Tooltip'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)

  // Close submenus when hamburger menu closes
  useEffect(() => {
    if (!open) {
      setGamesOpen(false)
      setProgressOpen(false)
      setAccountOpen(false)
      setCommunityOpen(false)
    }
  }, [open])

  return (
    <nav className="navbar" aria-label="Main navigation">
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
      <ul className={open ? 'open' : undefined}>
        <li>
          <Tooltip message="Hover here for a surprise!">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
          </Tooltip>
        </li>
        <li className="submenu">
          <button
            className="submenu-toggle"
            aria-expanded={gamesOpen}
            aria-controls="games-submenu"
            onClick={e => {
              e.stopPropagation()
              setGamesOpen(o => !o)
            }}
          >
            Games
          </button>
          <ul id="games-submenu" className={gamesOpen ? 'open' : undefined}>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/tone" onClick={() => setOpen(false)}>
                  Tone
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/quiz" onClick={() => setOpen(false)}>
                  Hallucinations
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/escape" onClick={() => setOpen(false)}>
                  Escape Room
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/recipe" onClick={() => setOpen(false)}>
                  Prompt Builder
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/darts" onClick={() => setOpen(false)}>
                  Prompt Darts
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/games/compose" onClick={() => setOpen(false)}>
                  Compose Tweet
                </Link>
              </Tooltip>
            </li>
          </ul>
        </li>
        <li className="submenu">
          <button
            className="submenu-toggle"
            aria-expanded={progressOpen}
            aria-controls="progress-submenu"
            onClick={e => {
              e.stopPropagation()
              setProgressOpen(o => !o)
            }}
          >
            Progress
          </button>
          <ul id="progress-submenu" className={progressOpen ? 'open' : undefined}>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/leaderboard" onClick={() => setOpen(false)}>
                  Leaderboard
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/badges" onClick={() => setOpen(false)}>
                  Badges
                </Link>
              </Tooltip>
            </li>
          </ul>
        </li>
        <li className="submenu">
          <button
            className="submenu-toggle"
            aria-expanded={accountOpen}
            aria-controls="account-submenu"
            onClick={e => {
              e.stopPropagation()
              setAccountOpen(o => !o)
            }}
          >
            Account &amp; Help
          </button>
          <ul id="account-submenu" className={accountOpen ? 'open' : undefined}>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/profile" onClick={() => setOpen(false)}>
                  Profile
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/help" onClick={() => setOpen(false)}>
                  Help
                </Link>
              </Tooltip>
            </li>
          </ul>
        </li>
        <li className="submenu">
          <button
            className="submenu-toggle"
            aria-expanded={communityOpen}
            aria-controls="community-submenu"
            onClick={e => {
              e.stopPropagation()
              setCommunityOpen(o => !o)
            }}
          >
            Community
          </button>
          <ul id="community-submenu" className={communityOpen ? 'open' : undefined}>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/community" onClick={() => setOpen(false)}>
                  Community Home
                </Link>
              </Tooltip>
            </li>
            <li>
              <Tooltip message="Hover here for a surprise!">
                <Link href="/playlist" onClick={() => setOpen(false)}>
                  Playlist
                </Link>
              </Tooltip>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}
