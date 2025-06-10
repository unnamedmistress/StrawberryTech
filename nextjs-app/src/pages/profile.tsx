import { useContext, useState, useMemo } from 'react'
import Link from 'next/link'
import { notify } from '../../../shared/notify'
import { UserContext } from '../../../shared/UserContext'
import ThemeToggle from '../components/layout/ThemeToggle'
import { useLeaderboards, type PointsEntry } from '../../../shared/useLeaderboards'
import { getTotalPoints } from '../utils/user'


import '../styles/ProfilePage.css'

export default function ProfilePage() {
  const { user, setName, setAge, setDifficulty } = useContext(UserContext)
  const [name, setNameState] = useState(user.name ?? '')
  const [age, setAgeState] = useState<string>(user.age ? String(user.age) : '')
  const [difficulty, setDifficultyState] = useState(user.difficulty)

  const { data: scoresRaw } = useLeaderboards()
  const scores = scoresRaw ?? {}

  const totalPoints = useMemo(() => getTotalPoints(user.points), [user.points])

  const topScores = useMemo(() => {
    const result: Record<string, number> = {}
    Object.entries(scores).forEach(([game, entries]) => {
      if (Array.isArray(entries) && entries.length > 0) {
        result[game] = Math.max(...entries.map(e => e.points))
      }
    })
    return result
  }, [scores])

  const games = useMemo(
    () => Array.from(new Set([...Object.keys(user.points), ...Object.keys(topScores)])),
    [user.points, topScores]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ageNum = Number(age)
    if (!name.trim()) {
      notify('Please enter your name')
      return
    }
    if (!age || Number.isNaN(ageNum) || ageNum <= 0) {
      notify('Age must be a valid number')
      return
    }
    setName(name.trim())
    setAge(ageNum)
    setDifficulty(difficulty)
    notify('Profile saved successfully!')
  }

  return (
    <div className="profile-page">
      <form className="profile-card" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setNameState(e.target.value)}
        />
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAgeState(e.target.value)}
        />
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={e => setDifficultyState(e.target.value as 'easy' | 'medium' | 'hard')}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <ThemeToggle />

        <button type="submit">Save</button>
        <Link href="/leaderboard" className="return-link">
          Return to Progress
        </Link>
      </form>
      <div className="stats-card">
        <h3>Your Progress</h3>
        <p>Total Points: {totalPoints}</p>
        <p>Badges Earned: {user.badges.length}</p>
        {user.badges.length > 0 && (
          <div className="badge-icons">
            {user.badges.map((b) => (
              <span key={b} role="img" aria-label={b}>
                🏅
              </span>
            ))}
          </div>
        )}
        {games.length > 0 && (
          <table className="score-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Your Best</th>
                <th>Top Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g}>
                  <td>{g}</td>
                  <td>{user.points[g] ?? 0}</td>
                  <td>{topScores[g] ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Your Profile | StrawberryTech</title>
      <meta name="description" content="Edit your name, age and difficulty level." />
      <link rel="canonical" href="https://strawberrytech.com/profile" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
