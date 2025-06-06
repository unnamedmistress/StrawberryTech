import { useState } from 'react'
import { Link } from 'react-router-dom'
import Post, { PostData } from '../components/Post'

const initialPosts: PostData[] = [
  {
    id: 1,
    title: 'Welcome Meme',
    image:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmM2cG9tbDNmYzIybHM4aGd1aXBhbHFhb3M1eTUwczdtdGN1eDBydCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEduSbSGpGaRX2Vri/giphy.gif',
  },
  {
    id: 2,
    title: 'Coding Time',
    image:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdG1sbmFzeG8zazI4dGIxeHF6NmZ2dXg5YWNra2k1bzJiZTZjdHA1biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l4FGuhL4U2WyjdkaY/giphy.gif',
  },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts)

  function flagPost(id: number) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flagged: true } : p)))
  }

  return (
    <div className="community-page">
      <h2>Community</h2>
      {posts.map((p) => (
        <Post key={p.id} post={p} onFlag={flagPost} />
      ))}
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}
