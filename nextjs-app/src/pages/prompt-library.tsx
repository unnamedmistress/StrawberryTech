import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Card from '../components/ui/card'
import { getApiBase } from '../utils/api'

interface PromptData {
  id: string
  text: string
  category: string
  author?: string
  created: string
}

export default function PromptLibraryPage({ initialPrompts = [] }: { initialPrompts?: PromptData[] }) {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const base = getApiBase()
      const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: prompts = initialPrompts, mutate, error: swrError, isLoading } = useSWR<PromptData[]>(
    `/api/prompts`,
    fetcher,
    {
      refreshInterval: 0, // Disable auto-refresh for debugging
      fallbackData: initialPrompts, // Use initial data as fallback
    }
  )

  // Debug logging
  console.log('Prompts data:', prompts)
  console.log('SWR error:', swrError)
  console.log('Is loading:', isLoading)
  console.log('Base URL:', base)

  async function addPrompt(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const resp = await fetch(`/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Your message was filtered, try again.')
        return
      }
      setNotice('Prompt added successfully!')
      setError('')
      setText('')
      mutate()
    } catch {
      setError('Your message was filtered, try again.')
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
      
      {/* Debug info for troubleshooting */}
      {swrError && (
        <div style={{ background: '#ffe6e6', padding: '1rem', margin: '1rem 0', border: '1px solid #ff9999' }}>
          <strong>Error loading prompts:</strong> {swrError.toString()}
        </div>
      )}
      
      {isLoading && (
        <div style={{ background: '#e6f3ff', padding: '1rem', margin: '1rem 0', border: '1px solid #99ccff' }}>
          Loading prompts...
        </div>
      )}
      
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
              >                All ({prompts.length})
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  style={{ display: 'block', marginBottom: '0.5rem' }}
                >
                  {cat} ({prompts.filter(p => p.category === cat).length})
                </button>
              </li>
            ))}
          </ul>
        </aside>        <div style={{ flex: 1 }}>
          {filtered.length === 0 && !isLoading ? (
            <div style={{ background: '#fff3cd', padding: '1rem', border: '1px solid #ffeaa7', marginBottom: '1rem' }}>
              {prompts.length === 0 ? 'No prompts available yet.' : 'No prompts match your search.'}
            </div>
          ) : (            filtered.map(p => (
              <Card key={p.id} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: 0, color: '#e91e63', fontSize: '0.9rem' }}>
                      {p.author || 'Anonymous'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                      {new Date(p.created).toLocaleDateString()} • {p.category}
                    </p>
                  </div>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', margin: '0.5rem 0' }}>{p.text}</p>
              </Card>
            ))
          )}
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

export const getServerSideProps = async () => {
  // Fetch prompts on server-side for initial render
  try {
    const res = await fetch('https://strawberry-tech.vercel.app/api/prompts')
    const prompts = await res.json()
    return { props: { initialPrompts: prompts } }
  } catch (error) {
    console.error('Failed to fetch prompts:', error)
    return { props: { initialPrompts: [] } }
  }
}
