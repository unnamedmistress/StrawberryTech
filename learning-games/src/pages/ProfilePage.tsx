import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { notify } from '../shared/notify'
import { UserContext } from '../shared/UserContext'
import ThemeToggle from '../components/layout/ThemeToggle'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, setName, setAge, setDifficulty } = useContext(UserContext)
  const [name, setNameState] = useState(user.name ?? '')
  const [age, setAgeState] = useState<string>(user.age ? String(user.age) : '')
  const [difficulty, setDifficultyState] = useState(user.difficulty)

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
        <Link to="/leaderboard" className="return-link">
          Return to Progress
        </Link>
      </form>
    </div>
  )
}
