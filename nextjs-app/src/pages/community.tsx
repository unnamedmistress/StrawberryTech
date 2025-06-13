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
          ))}</div>          <button
            type="button"
            className={styles.shareBtn}
            onClick={async () => {
              const badgeCount = user.badges.length
              const badgeText = badgeCount > 0 ? ` and earned ${badgeCount} badge${badgeCount > 1 ? 's' : ''}` : ''
                const shareData = {
                title: 'StrawberryTech - AI Prompting Skills',
                text: `I scored ${totalPoints} points learning AI prompting on StrawberryTech${badgeText}! 🍓 Join me and level up your AI skills!`,
                url: 'https://strawberry-tech.vercel.app/community'
              }
              
              try {
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  await navigator.share(shareData)
                  notify('Thanks for sharing! 🎉')
                } else {
                  // Fallback: copy nicely formatted text to clipboard
                  const shareText = `${shareData.text}\n\n${shareData.url}`
                  await navigator.clipboard.writeText(shareText)
                  notify('Share text copied to clipboard! 📋')
                }
              } catch (error) {
                // If sharing was cancelled or failed, try clipboard as backup
                try {
                  const shareText = `${shareData.text}\n\n${shareData.url}`
                  await navigator.clipboard.writeText(shareText)
                  notify('Share text copied to clipboard! 📋')
                } catch {
                  notify('Unable to share or copy text 😅')
                }
              }            }}
            aria-label={`Share your progress: ${totalPoints} points${user.badges.length > 0 ? ` and ${user.badges.length} badge${user.badges.length > 1 ? 's' : ''}` : ''}`}
          >
            📤 Share Progress
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
        content="Join the StrawberryTech community! Share your AI prompting progress and connect with other learners."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/community" />
        {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://strawberry-tech.vercel.app/community" />
      <meta property="og:title" content="StrawberryTech Community - AI Prompting Skills" />
      <meta property="og:description" content="Join thousands learning AI prompting skills through fun, interactive games. Share your progress and connect with other learners!" />
      <meta property="og:image" content="https://strawberry-tech.vercel.app/android-chrome-512x512.png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content="StrawberryTech Community - Share your AI learning progress" />
      <meta property="og:site_name" content="StrawberryTech" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:site" content="@strawberrytech" />
      <meta property="twitter:creator" content="@strawberrytech" />
      <meta property="twitter:url" content="https://strawberry-tech.vercel.app/community" />
      <meta property="twitter:title" content="StrawberryTech Community - AI Prompting Skills" />
      <meta property="twitter:description" content="Join thousands learning AI prompting skills through fun, interactive games. Share your progress and connect with other learners!" />
      <meta property="twitter:image" content="https://strawberry-tech.vercel.app/android-chrome-512x512.png" />
      <meta property="twitter:image:alt" content="StrawberryTech Community - Share your AI learning progress" />
      
      {/* Additional social sharing optimization */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="StrawberryTech" />
      <meta name="keywords" content="AI prompting community, AI learning progress, prompt engineering, AI skills sharing, interactive learning community" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
