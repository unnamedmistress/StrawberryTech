import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Post from '../components/Post'
import type { PostData } from '../components/Post'
import { UserContext } from '../context/UserContext'

const STORAGE_KEY = 'community_posts'

const initialPosts: PostData[] = [
  {
    id: 1,
    author: 'Admin',
    content: 'Welcome to the new message board!',
    date: '2025-01-01T00:00:00Z',
  },
]

export default function CommunityPage() {
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])

  function flagPost(id: number) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flagged: true } : p)))
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
      setPosts((prev) => [...prev, newPost])
      setMessage('')
    }
  }

  return (
    <div className="community-page">
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
