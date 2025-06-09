import { useContext, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { UserContext } from '../context/UserContext'
import ProgressSidebar from '../components/layout/ProgressSidebar'
import '../styles/LeaderboardPage.css'
import { getApiBase } from '../utils/api'

export interface PointsEntry {
  name: string
  points: number
}


export default function LeaderboardPage() {
  const { user } = useContext(UserContext)

  const [filter, setFilter] = useState('')
  const [sortField, setSortField] = useState<'name' | 'points'>('points')
  const [ascending, setAscending] = useState(false)

  const [pointsData, setPointsData] = useState<Record<string, PointsEntry[]>>({})
  const [game, setGame] = useState('tone')
  const tabs = useMemo(() => {
    const base = ['tone', 'quiz', 'darts', 'recipe', 'escape', 'compose']
    const dynamic = Object.keys(pointsData)
    return Array.from(new Set([...base, ...dynamic]))
  }, [pointsData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = getApiBase()
      fetch(`${base}/api/scores`)
        .then(res => (res.ok ? res.json() : {}))
        .then(data => setPointsData(data))
        .catch(() => {})
    }
  }, [])

  const entries = useMemo(() => {
    const list = (pointsData[game] ?? []).slice()
    const playerName = user.name ?? 'You'
    const existing = list.find(e => e.name === playerName)
    if (!existing) list.push({ name: playerName, points: user.points[game] ?? 0 })
    return list
      .filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortField === 'name') {
          const cmp = a.name.localeCompare(b.name)
          return ascending ? cmp : -cmp
        }
        const cmp = a.points - b.points
        return ascending ? cmp : -cmp
      })
  }, [filter, sortField, ascending, user.name, user.points, pointsData, game])

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
          <Link href="/">Return Home</Link>
        </p>
      </div>
      <ProgressSidebar />
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Leaderboard | StrawberryTech</title>
      <meta name="description" content="See top points across all games." />
      <link rel="canonical" href="https://strawberrytech.com/leaderboard" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
