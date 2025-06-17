import { useContext, useEffect, useState } from 'react'
import { notify } from '../shared/notify'
import { Link } from 'react-router-dom'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import { getApiBase } from '../utils/api'

const STORAGE_KEY = 'community_posts'
const MAX_POSTS = 20

function prunePosts(list: PostData[]): PostData[] {
  return list.slice(-MAX_POSTS)
}

const initialPosts: PostData[] = [
  {
    id: 1,
    author: 'Admin',
    content: 'Welcome to the new message board!',
    date: '2025-01-01T00:00:00Z',
  },
]

export default function CommunityPage() {
  const { user } = useContext(UserContext) as UserContextType
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/posts`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: PostData[]) =>
          setPosts(data.length ? prunePosts(data) : initialPosts)
        )
        .catch(() => {
          setError('Failed to load posts')
          notify('Failed to load posts')
        })
    }
  }, [])

  useEffect(() => {
    // Persist only the most recent MAX_POSTS so localStorage doesn't grow without bound
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prunePosts(posts)))
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

  function addPost(e: React.FormEvent) {
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
      setPosts((prev) => prunePosts([...prev, newPost]))
      if (typeof window !== 'undefined') {
        const base = getApiBase()
        fetch(`${base}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        }).catch(() => {
          setError('Failed to post')
          notify('Failed to post')
        })
      }
      setError('')
      setMessage('')
    }
  }

  return (
    <div id="main-content" className="community-page">
      <h2>Community</h2>
      <form onSubmit={addPost} style={{ marginBottom: '1rem' }}>
        <label htmlFor="message">Share your thoughts:</label>
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
      {posts
        .slice()
        .reverse()
        .map((p) => (
          <Post key={p.id} post={p} onFlag={flagPost} />
        ))}
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}
