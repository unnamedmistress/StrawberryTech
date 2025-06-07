import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { BADGES } from '../data/badges'
import './BadgesPage.css'

export default function BadgesPage() {
  const { user } = useContext(UserContext)
  return (
    <div className="badges-page">
      <h2>Badges</h2>
      <ul className="badge-list">
        {BADGES.map(b => (
          <li key={b.id} className={user.badges.includes(b.id) ? 'earned' : ''}>
            <strong>{b.name}</strong>
            <p>{b.description}</p>
          </li>
        ))}
      </ul>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            const earned = user.badges.join(', ') || 'none'
            const text = `I have earned these badges on StrawberryTech: ${earned}`
            if (navigator.share) {
              navigator.share({ text }).catch(() => {})
            } else {
              navigator.clipboard.writeText(text).catch(() => {})
            }
          }}
        >
          Share Badges
        </button>
      </p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/leaderboard">Return to Progress</Link>
      </p>
    </div>
  )
}
