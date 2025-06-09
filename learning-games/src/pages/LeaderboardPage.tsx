import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import { useLeaderboards } from '../shared/useLeaderboards'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import './LeaderboardPage.css'



export default function LeaderboardPage() {
  const { user } = useContext(UserContext) as UserContextType

  const [filter, setFilter] = useState('')
  const [sortField, setSortField] = useState<'name' | 'points'>('points')
  const [ascending, setAscending] = useState(false)

  const { data: pointsData = {} } = useLeaderboards()
  const [game, setGame] = useState('tone')
  const tabs = useMemo(() => {
    const base = ['tone', 'quiz', 'darts', 'recipe', 'escape', 'compose']
    const dynamic = Object.keys(pointsData || {})
    return Array.from(new Set([...base, ...dynamic]))
  }, [pointsData])

  const entries = useMemo(() => {
    const list = ((pointsData && pointsData[game]) ?? []).slice()
    const playerId = user.id
    const existing = list.find((e: any) => e.id === playerId)
    if (!existing) list.push({ id: playerId, name: user.name ?? 'You', points: user.points[game] ?? 0 })
    return list
      .filter((e: any) => e.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a: any, b: any) => {
        if (sortField === 'name') {
          const cmp = a.name.localeCompare(b.name)
          return ascending ? cmp : -cmp
        }
        const cmp = a.points - b.points
        return ascending ? cmp : -cmp
      })
  }, [filter, sortField, ascending, user.id, user.name, user.points, pointsData, game])

  function handleSort(field: 'name' | 'points') {
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
          <h3>{game} High Points</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => handleSort('name')}>
                    Player {sortField === 'name' ? (ascending ? '▲' : '▼') : ''}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort('points')}>
                    Points {sortField === 'points' ? (ascending ? '▲' : '▼') : ''}
                  </button>
                </th>
              </tr>
            </thead>            <tbody>
              {entries.map((entry: any, idx: any) => (
                <tr
                  key={entry.id || entry.name}
                  className={idx === 0 ? 'top-row' : undefined}
                  style={{
                    fontWeight: entry.id === user.id ? 'bold' : undefined,
                  }}
                >
                  <td>{entry.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                const text = `My top points in ${game} is ${user.points[game] ?? 0}!`
                if (navigator.share) {
                  navigator.share({ text }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(text).catch(() => {})
                  toast.success('Points copied to clipboard')
                }
              }}
            >
              Share My Points
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
