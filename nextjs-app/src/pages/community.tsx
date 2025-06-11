import { useContext, useEffect, useState } from 'react'
import { notify } from '../shared/notify'
import Link from 'next/link'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import styles from '../styles/CommunityPage.module.css'
import { getApiBase } from '../utils/api'

const STORAGE_KEY = 'community_posts'

const initialPosts: PostData[] = [
  {
    id: 1,
    author: 'Admin',
    content: 'Welcome to the new message board!',
    date: '2025-01-01T00:00:00Z',
    sentiment: 1,
    status: 'approved',
  },
]

export default function CommunityPage() {
  const { user } = useContext(UserContext) as UserContextType
  const [posts, setPosts] = useState<PostData[]>(initialPosts)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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

  function flagPost(id: number) {
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
          setError(data.error || 'Failed to post')
          return
        }
        if (data.status === 'approved') {
          setPosts((prev) => [...prev, data])
          setNotice('Thanks for sharing!')
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
    <div className="community-page">
      <h2>Community Feedback</h2>
      <form onSubmit={addPost} className={styles.form}>
        <label htmlFor="message">Add your feedback here:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className={styles.textarea}
        />
        <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Posts are anonymized and reviewed for positivity.
        </p>
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
          Submit
        </button>
      </form>
      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" style={{ color: 'green' }}>
          {notice}
        </p>
      )}
      <ul className={styles.list}>
        {posts
          .slice()
          .reverse()
          .map((p) => (
            <li key={p.id}>
              <Post post={p} onFlag={flagPost} />
            </li>
          ))}
      </ul>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Community Feedback | StrawberryTech</title>
      <meta
        name="description"
        content="Read positive feedback from other players."
      />
      <link rel="canonical" href="https://strawberrytech.com/community" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
