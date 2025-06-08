import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserContext } from '../context/UserContext'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import './LeaderboardPage.css'

export interface ScoreEntry {
  name: string
  score: number
}


export default function LeaderboardPage() {
  const { user } = useContext(UserContext)

  const [filter, setFilter] = useState('')
  const [sortField, setSortField] = useState<'name' | 'score'>('score')
  const [ascending, setAscending] = useState(false)

  const [scores, setScores] = useState<Record<string, ScoreEntry[]>>({})
  const [game, setGame] = useState('tone')
  const tabs = useMemo(() => {
    const base = ['tone', 'quiz', 'darts', 'recipe', 'escape', 'compose']
    const dynamic = Object.keys(scores)
    return Array.from(new Set([...base, ...dynamic]))
  }, [scores])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/scores`)
        .then(res => (res.ok ? res.json() : {}))
        .then(data => setScores(data))
        .catch(() => {})
    }
  }, [])

  const entries = useMemo(() => {
    const list = (scores[game] ?? []).slice()
    const playerName = user.name ?? 'You'
    const existing = list.find(e => e.name === playerName)
    if (!existing) list.push({ name: playerName, score: user.scores[game] ?? 0 })
    return list
      .filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortField === 'name') {
          const cmp = a.name.localeCompare(b.name)
          return ascending ? cmp : -cmp
        }
        const cmp = a.score - b.score
        return ascending ? cmp : -cmp
      })
  }, [filter, sortField, ascending, user.name, user.scores, scores, game])

  function handleSort(field: 'name' | 'score') {
    if (sortField === field) {
      setAscending(!ascending)
    } else {
      setSortField(field)
      setAscending(field === 'name')
    }
  }

  return (
    <div className="leaderboard-wrapper">
      <div>
        <h2>Leaderboard</h2>
        <section className="leaderboard-card">
          <div className="game-tabs">
            {tabs.map(key => (
              <button
                key={key}
                className={game === key ? 'active' : undefined}
                type="button"
                onClick={() => setGame(key)}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search players"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <h3>{game} High Scores</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => handleSort('name')}>
                    Player {sortField === 'name' ? (ascending ? '▲' : '▼') : ''}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort('score')}>
                    Score {sortField === 'score' ? (ascending ? '▲' : '▼') : ''}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.name}
                  className={idx === 0 ? 'top-row' : undefined}
                  style={{
                    fontWeight:
                      user.name && entry.name === user.name ? 'bold' : undefined,
                  }}
                >
                  <td>{entry.name}</td>
                  <td>{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                const text = `My top score in ${game} is ${user.scores[game] ?? 0}!`
                if (navigator.share) {
                  navigator.share({ text }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(text).catch(() => {})
                  toast.success('Score copied to clipboard')
                }
              }}
            >
              Share My Score
            </button>
          </p>
        </section>

        <p style={{ marginTop: '2rem' }}>
          <Link to="/">Return Home</Link>
        </p>
      </div>
      <ProgressSidebar />
    </div>
  )
}
