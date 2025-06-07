import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import './LeaderboardPage.css'

export interface ScoreEntry {
  name: string
  score: number
}

// Dummy leaderboards for each game. In a real multi-user app this data would
// be fetched from a server.
export const DUMMY_SCORES: Record<string, ScoreEntry[]> = {
  tone: [
    { name: 'Alice', score: 240 },
    { name: 'Bob', score: 180 },
    { name: 'Charlie', score: 150 },
  ],
}

export default function LeaderboardPage() {
  const { user } = useContext(UserContext)

  const [filter, setFilter] = useState('')
  const [sortField, setSortField] = useState<'name' | 'score'>('score')
  const [ascending, setAscending] = useState(false)

  const entries = useMemo(() => {
    return DUMMY_SCORES.tone
      .concat({ name: user.name ?? 'You', score: user.scores['tone'] ?? 0 })
      .filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortField === 'name') {
          const cmp = a.name.localeCompare(b.name)
          return ascending ? cmp : -cmp
        }
        const cmp = a.score - b.score
        return ascending ? cmp : -cmp
      })
  }, [filter, sortField, ascending, user.name, user.scores])

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
          <div className="search-box">
            <input
              type="text"
              placeholder="Search players"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <h3>Tone High Scores</h3>
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
        </section>

        <p style={{ marginTop: '2rem' }}>
          <Link to="/">Return Home</Link>
        </p>
      </div>
      <ProgressSidebar />
    </div>
  )
}
