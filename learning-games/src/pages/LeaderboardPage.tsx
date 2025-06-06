import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { BADGES } from '../data/badges'

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

  return (
    <div>
      <h2>Leaderboard</h2>
      {/* Show top scores for Tone */}
      <section>
        <h3>Tone High Scores</h3>
        <table style={{ margin: '0 auto' }}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_SCORES.tone
              .concat({ name: user.name ?? 'You', score: user.scores['tone'] ?? 0 })
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((entry) => (
                <tr
                  key={entry.name}
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

      {/* Badges */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Badges Earned</h3>
        {user.badges.length === 0 && <p>No badges yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
          {user.badges.map((id) => {
            const def = BADGES.find((b) => b.id === id)
            return (
              <li key={id} style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                <strong>{def?.name ?? id}</strong>
                <div style={{ fontSize: '0.9em' }}>{def?.description}</div>
              </li>
            )
          })}
        </ul>
      </section>

      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}
