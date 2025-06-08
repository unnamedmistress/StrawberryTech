import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../context/UserContext'

const STORAGE_KEY = 'testimonial_posts'

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

export default function TestimonialsPage() {
  const { user } = useContext(UserContext)
  const [posts, setPosts] = useState<PostData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as PostData[]
      } catch {
        return initialPosts
      }
    }
    return initialPosts
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/posts`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: PostData[]) => setPosts(data.length ? data : initialPosts))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])

  function flagPost(id: number) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flagged: true } : p)))
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/posts/${id}/flag`, { method: 'POST' }).catch(() => {})
    }
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim()) {
      const newPost: PostData = {
        id: Date.now(),
        author: user.name ?? 'Anonymous',
        content: message.trim(),
        date: new Date().toISOString(),
      }
      if (posts.some(p => p.author === newPost.author)) {
        setError('Limit reached: only one post per user')
        return
      }
      try {
        const base = window.location.origin
        const resp = await fetch(`${base}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        })
        const data = await resp.json()
        if (!resp.ok) {
          setError(data.error || 'Failed to post')
          return
        }
        if (data.status === 'approved') {
          setPosts(prev => [...prev, data])
          setNotice('Thanks for sharing your testimonial!')
        } else {
          setNotice('Thanks! Your testimonial is awaiting review.')
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
      <h2>Testimonials</h2>
      <form onSubmit={addPost} style={{ marginBottom: '1rem' }}>
        <label htmlFor="message">Share a positive experience:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
        />
        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
          Post
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
      {posts
        .slice()
        .reverse()
        .map((p) => (
          <Post key={p.id} post={p} onFlag={flagPost} />
        ))}
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Testimonials | StrawberryTech</title>
      <meta
        name="description"
        content="Read uplifting testimonials from other players."
      />
      <link rel="canonical" href="https://strawberrytech.com/testimonials" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
