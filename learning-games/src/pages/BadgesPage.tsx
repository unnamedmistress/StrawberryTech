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
            <span className="emoji" role="img" aria-label={b.name}>
              {b.emoji}
            </span>
            <strong>{b.name}</strong>
            <p>{b.description}</p>
          </li>
        ))}
      </ul>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            const earnedList = user.badges
              .map(id => {
                const badge = BADGES.find(b => b.id === id)
                return badge ? `${badge.emoji} ${badge.name}` : id
              })
              .join(', ')
            const text = earnedList
              ? `Check out my StrawberryTech badges: ${earnedList}! Try the games at https://strawberry-tech.vercel.app/`
              : `I'm playing StrawberryTech! Earn badges at https://strawberry-tech.vercel.app/`
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
