import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { notify } from '../shared/notify'
import { getApiBase } from '../utils/api'
import styles from '../styles/PromptLibrary.module.css'

interface PromptData {
  id: string
  text: string
  category: string
  author?: string
  created: string
}

// Sample prompts to ensure content is always available
const samplePrompts: PromptData[] = [
  {
    id: 'sample-1',
    text: 'Act as a creative writing assistant. Help me brainstorm ideas for a science fiction short story set in a world where artificial intelligence has become sentient.',
    category: 'Creative',
    author: 'CreativeWriter',
    created: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    text: 'You are a helpful coding mentor. Explain the concept of recursion in programming using simple examples that a beginner could understand.',
    category: 'Education',
    author: 'CodeMentor',
    created: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    text: 'Help me draft a professional email to request a meeting with my supervisor to discuss career development opportunities.',
    category: 'Business',
    author: 'CareerBuilder',
    created: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'sample-4',
    text: 'Create a fun and engaging way to explain photosynthesis to elementary school students, including an analogy they can easily relate to.',
    category: 'Education',
    author: 'TeachingPro',
    created: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'sample-5',
    text: 'You are a wellness coach. Provide 5 simple mindfulness exercises that can be done in under 5 minutes during a busy workday.',
    category: 'Health',
    author: 'WellnessGuru',
    created: new Date(Date.now() - 345600000).toISOString(),
  },
]

export default function PromptLibraryPage({ initialPrompts = [] }: { initialPrompts?: PromptData[] }) {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: fetchedPrompts = [], mutate, error: swrError, isLoading } = useSWR<PromptData[]>(
    `/api/prompts`,
    fetcher,
    {
      refreshInterval: 0,
      fallbackData: [],
      onError: (err) => console.error('SWR error:', err)
    }
  )

  // Combine fetched prompts with sample prompts, ensuring samples are always available
  const allPrompts = [...samplePrompts, ...fetchedPrompts]
  
  useEffect(() => {
    if (swrError) {
      console.error('Failed to load prompts:', swrError)
    }
  }, [swrError])

  async function addPrompt(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    
    setIsSubmitting(true)
    setError('')
    setNotice('')
    
    try {
      const resp = await fetch(`/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      
      const data = await resp.json()
      
      if (!resp.ok) {
        setError(data.error || 'Your prompt couldn\'t be added. Try being more specific about the task you want help with.')
        return
      }
      
      setNotice('Prompt added successfully! 🎉')
      setText('')
      mutate() // Refresh the data
      notify('Prompt added to library!')
      
    } catch (err) {
      console.error('Error adding prompt:', err)
      setError('Unable to add prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = ['Education', 'Creative', 'Business', 'Health', 'Technology', 'Entertainment']
  const allCategories = Array.from(new Set([...categories, ...allPrompts.map(p => p.category)]))
  
  const filtered = allPrompts.filter(p => {
    const matchesCategory = category === 'all' || p.category === category
    const matchesSearch = p.text.toLowerCase().includes(search.toLowerCase()) || 
                         p.category.toLowerCase().includes(search.toLowerCase()) ||
                         (p.author && p.author.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      'Education': '📚',
      'Creative': '🎨',
      'Business': '💼',
      'Health': '🏥',
      'Technology': '💻',
      'Entertainment': '🎭',
      'general': '📝'
    }
    return icons[cat] || '📝'
  }

  return (
    <div className={styles.promptLibrary}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            🧠 Prompt Library
          </h1>
          <p className={styles.subtitle}>
            Discover and share powerful AI prompts for every need
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="search"
                placeholder="Search prompts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.categoriesSection}>
            <h3 className={styles.sectionTitle}>Categories</h3>
            <div className={styles.categoryList}>
              <button
                onClick={() => setCategory('all')}
                className={`${styles.categoryButton} ${category === 'all' ? styles.active : ''}`}
              >
                <span className={styles.categoryIcon}>📝</span>
                <span className={styles.categoryText}>All</span>
                <span className={styles.categoryCount}>({allPrompts.length})</span>
              </button>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`${styles.categoryButton} ${category === cat ? styles.active : ''}`}
                >
                  <span className={styles.categoryIcon}>{getCategoryIcon(cat)}</span>
                  <span className={styles.categoryText}>{cat}</span>
                  <span className={styles.categoryCount}>
                    ({allPrompts.filter((p: PromptData) => p.category === cat).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.statsBar}>
            <span className={styles.resultCount}>
              {filtered.length} prompt{filtered.length !== 1 ? 's' : ''} found
            </span>
            {category !== 'all' && (
              <span className={styles.activeFilter}>
                {getCategoryIcon(category)} {category}
                <button 
                  onClick={() => setCategory('all')}
                  className={styles.clearFilter}
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading prompts...</p>
            </div>
          )}

          {filtered.length === 0 && !isLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🤔</div>
              <h3>No prompts found</h3>
              <p>
                {allPrompts.length === 0 
                  ? 'Be the first to add a prompt to the library!' 
                  : 'Try adjusting your search or category filter.'
                }
              </p>
            </div>
          ) : (
            <div className={styles.promptGrid}>
              {filtered.map(prompt => (
                <div key={prompt.id} className={styles.promptCard}>
                  <div className={styles.promptHeader}>
                    <div className={styles.promptMeta}>
                      <span className={styles.promptAuthor}>
                        👤 {prompt.author || 'Anonymous'}
                      </span>
                      <span className={styles.promptDate}>
                        {new Date(prompt.created).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.promptCategory}>
                      {getCategoryIcon(prompt.category)} {prompt.category}
                    </div>
                  </div>
                  <div className={styles.promptContent}>
                    <p>{prompt.text}</p>
                  </div>
                  <div className={styles.promptActions}>
                    <button 
                      className={styles.copyButton}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(prompt.text)
                          notify('Prompt copied to clipboard! 📋')
                        } catch {
                          notify('Unable to copy prompt')
                        }
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addPromptSection}>
            <h3 className={styles.sectionTitle}>💡 Share Your Prompt</h3>
            <p className={styles.sectionDescription}>
              Help others by sharing useful prompts you've discovered or created.
            </p>
            
            <form onSubmit={addPrompt} className={styles.promptForm}>
              <div className={styles.formGroup}>
                <label htmlFor="prompt-text" className={styles.formLabel}>
                  Your Prompt
                </label>
                <textarea
                  id="prompt-text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Example: Act as a helpful assistant and explain quantum computing in simple terms that a 10-year-old could understand..."
                  required
                  className={styles.formTextarea}
                  rows={4}
                />
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !text.trim()}
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.submitSpinner}></span>
                      Adding...
                    </>
                  ) : (
                    <>🚀 Add Prompt</>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}
            
            {notice && (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✅</span>
                {notice}
              </div>
            )}
          </div>
        </div>
      </div>      <div className={styles.footer}>
        <Link href="/" className={styles.homeLink}>
          ← Return Home
        </Link>
      </div>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Prompt Library | StrawberryTech</title>
      <meta name="description" content="Discover and share powerful AI prompts for education, creativity, business, and more. Browse our curated collection of prompts to enhance your AI interactions." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/prompt-library" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://strawberry-tech.vercel.app/prompt-library" />
      <meta property="og:title" content="AI Prompt Library | StrawberryTech" />
      <meta property="og:description" content="Discover and share powerful AI prompts for education, creativity, business, and more. Browse our curated collection of prompts to enhance your AI interactions." />
      <meta property="og:image" content="https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_20_14%20AM.png" />
      <meta property="og:image:width" content="1024" />
      <meta property="og:image:height" content="1024" />
      <meta property="og:image:alt" content="StrawberryTech Prompt Library - AI Prompts Collection" />
      <meta property="og:site_name" content="StrawberryTech" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:site" content="@strawberrytech" />
      <meta property="twitter:url" content="https://strawberry-tech.vercel.app/prompt-library" />
      <meta property="twitter:title" content="AI Prompt Library | StrawberryTech" />
      <meta property="twitter:description" content="Discover and share powerful AI prompts for education, creativity, business, and more." />
      <meta property="twitter:image" content="https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_20_14%20AM.png" />
      
      <meta name="keywords" content="AI prompts, artificial intelligence, prompt engineering, ChatGPT prompts, AI tools, machine learning" />
    </>
  )
}

export const getServerSideProps = async () => {
  // Always return empty array for server-side props since we have sample prompts
  // This prevents server-side API calls that might fail
  return { props: { initialPrompts: [] } }
}
