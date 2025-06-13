import { useContext, useEffect, useState, useMemo } from 'react'
import { notify } from '../shared/notify'
import Link from 'next/link'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import { getTotalPoints } from '../utils/user'
import styles from '../styles/CommunityPage.module.css'
import { getApiBase } from '../utils/api'

const STORAGE_KEY = 'community_posts'

const initialPosts: PostData[] = [
  {
    id: 1,
    author: 'Admin',
    content: 'Welcome to the community! Share your thoughts with other players.',
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
        <h1 className={styles.pageTitle}>Community</h1>
        
        <div className={styles.statsBar}>
          <span className={styles.points}>{totalPoints} pts</span>
          <div className={styles.badges}>{user.badges.map((b) => (
            <span key={b} className={styles.badge}>🏅</span>
          ))}</div>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => {
              const shareData = {
                text: `I scored ${totalPoints} points on StrawberryTech! 🍓`,
                url: 'https://strawberry-tech.vercel.app/',
              }
              if (navigator.share) {
                navigator.share(shareData).catch(() => {})
              } else {
                navigator.clipboard
                  .writeText(`${shareData.text} ${shareData.url}`)
                  .catch(() => {})
                notify('Share link copied to clipboard')
              }
            }}
          >
            Share
          </button>
        </div>

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
      
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Community | StrawberryTech</title>
      <meta
        name="description"
        content="Share feedback with other StrawberryTech players."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/community" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
