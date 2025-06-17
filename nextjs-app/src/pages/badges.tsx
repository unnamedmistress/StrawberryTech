import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import Spinner from '../components/ui/Spinner'
import { getApiBase } from '../utils/api'
import styles from '../styles/BadgesPage.module.css'

export default function BadgesPage() {
  const { user } = useContext(UserContext) as UserContextType
  interface BadgeDefinition {
    id: string
    name: string
    description: string
    emoji: string
  }
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const base = getApiBase()

  useEffect(() => {
    if (base) {
      fetch(`${base}/api/badges`)
        .then(res => (res.ok ? res.json() : []))
        .then(data => setBadges(data))
        .catch(() => {})
    }
  }, [base])

  const loading = badges.length === 0
  return (
    <div id="main-content" className={styles['badges-page']}>
      <h2>Badges</h2>
      {loading ? (
        <Spinner />
      ) : (
        <ul className={styles['badge-list']}>
          {badges.map(b => (
            <li
              key={b.id}
              className={user.badges.includes(b.id) ? styles.earned : ''}
            >
              <span className={styles.emoji} role="img" aria-label={b.name}>
                {b.emoji}
              </span>
              <strong>{b.name}</strong>
              <p>{b.description}</p>
            </li>
          ))}
        </ul>
      )}
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            const earnedList = user.badges
              .map(id => {
                const badge = badges.find(b => b.id === id)
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
      </p>      <p style={{ marginTop: '2rem' }}>
        <Link href="/community">Return to Community</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Badges | StrawberryTech</title>
      <meta name="description" content="View the badges you've earned from playing." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/badges" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
