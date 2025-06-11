import { useContext, useEffect, useMemo, useState } from 'react'
import { notify } from '../shared/notify'
import Link from 'next/link'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import { useLeaderboards, type PointsEntry } from '../shared/useLeaderboards'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import { getTotalPoints } from '../utils/user'
import styles from '../styles/CommunityPage.module.css'
import { getApiBase } from '../utils/api'

const STORAGE_KEY = 'community_posts'

const initialPosts: PostData[] = [
  {
    id: 1,
    author: 'Admin',
    content: 'Welcome to the community! Share your thoughts and see how you rank!',
    date: '2025-01-01T00:00:00Z',
    sentiment: 1,
    status: 'approved',
  },
]

export default function CommunityPage() {
  const { user } = useContext(UserContext) as UserContextType
  
  // Community state
  const [posts, setPosts] = useState<PostData[]>(initialPosts)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  
  // Leaderboard state
  const [filter, setFilter] = useState('')
  const [game, setGame] = useState('tone')
  const { data: pointsDataRaw, loading } = useLeaderboards()
  const pointsData = pointsDataRaw ?? {}
  
  const tabs = useMemo(() => {
    const base = ['tone', 'quiz', 'escape', 'recipe', 'darts', 'chain']
    const dynamic = Object.keys(pointsData)
    return Array.from(new Set([...base, ...dynamic]))
  }, [pointsData])

  const topEntries = useMemo(() => {
    const list = (pointsData[game] ?? []).slice()
    const playerId = user.id
    const existing = list.find((e: PointsEntry) => e.id === playerId)
    if (!existing) list.push({ id: playerId, name: user.name ?? 'You', points: user.points[game] ?? 0 })
    return list
      .filter((e: PointsEntry) => e.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a: PointsEntry, b: PointsEntry) => b.points - a.points)
      .slice(0, 5) // Only show top 5
  }, [filter, user.id, user.name, user.points, pointsData, game])

  const totalPoints = useMemo(() => getTotalPoints(user.points), [user.points])

  // Load from localStorage after mount to prevent hydration issues
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPosts(JSON.parse(saved) as PostData[])
      } catch {
        setPosts(initialPosts)
      }
    }
  }, [])


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/posts`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: PostData[]) => setPosts(data.length ? data : initialPosts))
        .catch(() => {
          setError('Failed to load posts')
          notify('Failed to load posts')
        })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])
  function flagPost(id: number | string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flagged: true } : p)))
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/posts/${id}/flag`, { method: 'POST' })
        .catch(() => {
          setError('Failed to flag post')
          notify('Failed to flag post')
        })
    }
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim()) {
      try {
        const base = getApiBase()
        const resp = await fetch(`${base}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message.trim() }),
        })
        const data = await resp.json()
        if (!resp.ok) {
          setError(data.error || 'Your message was filtered, try again.')
          return
        }
        if (data.status === 'approved') {
          setPosts((prev) => [...prev, data])
          setNotice('Thanks for sharing! Your message is now live.')
        } else {
          setNotice('Thanks! Your feedback is awaiting review.')
        }
        setError('')
        setMessage('')
      } catch {
        setError('Failed to post')
      }
    }
  }
  return (
    <div className={styles.communityWrapper}>
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Community & Leaderboard</h1>
        
        {/* Leaderboard Section */}
        <section className={styles.leaderboardSection}>
          <h2 className={styles.sectionTitle}>Top Players</h2>
          
          <div className={styles.gameTabs}>
            {tabs.map(key => (
              <button
                key={key}
                className={`${styles.gameTab} ${game === key ? styles.active : ''}`}
                type="button"
                onClick={() => setGame(key)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className={styles.leaderboardCard}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search players..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.playersGrid}>
              {topEntries.map((entry: PointsEntry, idx: number) => (
                <div
                  key={entry.id || entry.name}
                  className={`${styles.playerCard} ${idx === 0 ? styles.topPlayer : ''} ${
                    entry.id === user.id ? styles.currentUser : ''
                  }`}
                >
                  <div className={styles.playerRank}>
                    {idx === 0 ? '🏆' : `#${idx + 1}`}
                  </div>
                  <div className={styles.playerInfo}>
                    <div className={styles.playerName}>{entry.name}</div>
                    <div className={styles.playerStats}>
                      <span className={styles.points}>{entry.points} pts</span>
                      {entry.id === user.id && user.badges.length > 0 && (
                        <div className={styles.badges}>
                          {user.badges.slice(0, 3).map((badge) => (
                            <span key={badge} className={styles.badge}>🏅</span>
                          ))}
                          {user.badges.length > 3 && (
                            <span className={styles.badgeCount}>+{user.badges.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.userSummary}>
              <div className={styles.yourStats}>
                <span>Your Total: {totalPoints} pts</span>
                <span>Badges: {user.badges.length}</span>
              </div>
              <button
                type="button"
                className={styles.shareBtn}
                onClick={() => {
                  const text = `I scored ${user.points[game] ?? 0} points in ${game} on StrawberryTech! 🍓`
                  if (navigator.share) {
                    navigator.share({ text }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(text).catch(() => {})
                    notify('Points copied to clipboard')
                  }
                }}
              >
                Share Score
              </button>
            </div>
          </div>
        </section>

        {/* Community Feedback Section */}
        <section className={styles.communitySection}>
          <h2 className={styles.sectionTitle}>Community Feedback</h2>
          
          <form onSubmit={addPost} className={styles.feedbackForm}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts about the games..."
              required
              className={styles.feedbackTextarea}
            />
            <div className={styles.formFooter}>
              <span className={styles.formNote}>Posts are reviewed for positivity</span>
              <button type="submit" className={styles.submitBtn}>
                Share Feedback
              </button>
            </div>
          </form>

          {error && (
            <div role="alert" className={styles.errorMessage}>
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className={styles.successMessage}>
              {notice}
            </div>
          )}

          <div className={styles.postsContainer}>
            {posts
              .slice()
              .reverse()
              .map((p) => (
                <div key={p.id} className={styles.postWrapper}>
                  <Post post={p} onFlag={flagPost} />
                </div>
              ))}
          </div>
        </section>

        <div className={styles.navigation}>
          <Link href="/" className={styles.homeLink}>← Return Home</Link>
          <Link href="/profile" className={styles.profileLink}>Edit Profile →</Link>
        </div>
      </div>
      
      <ProgressSidebar />
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Community & Leaderboard | StrawberryTech</title>
      <meta
        name="description"
        content="See top players and share feedback with the StrawberryTech community."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/community" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
