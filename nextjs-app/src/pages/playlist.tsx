import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface PromptPair {
  id: number
  bad: string
  good: string
}

const STORAGE_KEY = 'prompt_pairs'

export default function CommunityPlaylistPage() {
  const [pairs, setPairs] = useState<PromptPair[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as PromptPair[]
      } catch {
        return []
      }
    }
    return []
  })
  const [bad, setBad] = useState('')
  const [good, setGood] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/pairs`)
        .then(res => (res.ok ? res.json() : []))
        .then((data: PromptPair[]) => data.length && setPairs(data))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs))
  }, [pairs])

  function addPair(e: React.FormEvent) {
    e.preventDefault()
    if (!bad.trim() || !good.trim()) return
    const pair: PromptPair = { id: Date.now(), bad: bad.trim(), good: good.trim() }
    setPairs(prev => [...prev, pair])
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/pairs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pair),
      }).catch(() => {})
    }
    setBad('')
    setGood('')
  }

  return (
    <div className="playlist-page">
      <h2>Community Playlist</h2>
      <form onSubmit={addPair} style={{ marginBottom: '1rem' }}>
        <label htmlFor="bad">Bad prompt:</label>
        <textarea
          id="bad"
          value={bad}
          onChange={e => setBad(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
        />
        <label htmlFor="good">Good prompt:</label>
        <textarea
          id="good"
          value={good}
          onChange={e => setGood(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit" className="btn-primary">
          Save Pair
        </button>
      </form>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {pairs
          .slice()
          .reverse()
          .map(p => (
            <li key={p.id} style={{ marginBottom: '1rem' }}>
              <strong>Bad:</strong> {p.bad}
              <br />
              <strong>Good:</strong> {p.good}
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
      <title>Community Playlist | StrawberryTech</title>
      <meta
        name="description"
        content="Share good and bad prompt pairs with the community."
      />
    </>
  )
}
