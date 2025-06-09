import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Card from '../components/ui/card'
import { getApiBase } from '../utils/api'

interface PromptData {
  id: string
  text: string
  category: string
  created: string
}

export default function PromptLibraryPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const base = getApiBase()
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: prompts = [], mutate } = useSWR<PromptData[]>(
    base ? `${base}/api/prompts` : null,
    fetcher
  )

  async function addPrompt(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const resp = await fetch(`${base}/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Failed to add prompt')
        return
      }
      setNotice('Prompt added!')
      setError('')
      setText('')
      mutate()
    } catch {
      setError('Failed to add prompt')
    }
  }

  const categories = Array.from(new Set(prompts.map(p => p.category)))
  const filtered = prompts.filter(p => {
    return (
      (category === 'all' || p.category === category) &&
      p.text.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="prompt-library-page">
      <h2>Prompt Library</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <aside>
          <input
            type="search"
            aria-label="Search prompts"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '1rem', width: '100%' }}
          />
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <button
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
                style={{ display: 'block', marginBottom: '0.5rem' }}
              >
                All
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  style={{ display: 'block', marginBottom: '0.5rem' }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div style={{ flex: 1 }}>
          {filtered.map(p => (
            <Card key={p.id} style={{ marginBottom: '1rem' }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{p.text}</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{p.category}</p>
            </Card>
          ))}
          <form onSubmit={addPrompt} style={{ marginTop: '1rem' }}>
            <label htmlFor="prompt-text">Add a prompt:</label>
            <textarea
              id="prompt-text"
              value={text}
              onChange={e => setText(e.target.value)}
              required
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
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
        </div>
      </div>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Prompt Library | StrawberryTech</title>
      <meta name="description" content="Browse community prompts by category." />
      <link rel="canonical" href="https://strawberrytech.com/prompt-library" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })
