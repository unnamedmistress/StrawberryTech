import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import ProgressSidebar from '../components/layout/ProgressSidebar'

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
    <div className="leaderboard-wrapper">
      <ProgressSidebar />
      <div>
        <h2>Leaderboard</h2>
        <img
          src="https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif"
          alt="Trophy animation"
          style={{ width: '120px', marginBottom: '1rem' }}
        />
      {/* Show top scores for Tone */}
      <section className="leaderboard-card">
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
              .map((entry, idx) => (
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
    </div>
  )
}
