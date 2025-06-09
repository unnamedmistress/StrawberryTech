import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import './AgeInputForm.css'

/**
 * Form for collecting the user's age. Age is stored in context
 * and later used to customize game content by age group.
 */
export default function AgeInputForm({
  onSaved,
  allowEdit = false,
}: {
  onSaved?: () => void
  allowEdit?: boolean
}) {
  const { user, setAge, setName, setDifficulty } = useContext(UserContext) as UserContextType
  const [age, setAgeState] = useState<number | ''>(user.age ?? '')
  const [name, setNameState] = useState(user.name ?? '')
  const [difficulty, setDifficultyState] = useState(user.difficulty)
  const navigate = useNavigate()

  // If age already exists and editing isn't allowed, redirect away
  useEffect(() => {
    if (user.age && !allowEdit) navigate('/leaderboard')
  }, [user.age, navigate, allowEdit])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ageNumber = Number(age)
    if (!Number.isNaN(ageNumber) && ageNumber > 0) {
      setAge(ageNumber)
      if (name) setName(name)
      setDifficulty(difficulty)
      if (onSaved) {
        onSaved()
      } else {
        navigate('/leaderboard')
      }
    } else {
      alert('Please enter a valid age')
    }
  }

  return (
    <div className="age-form">
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setNameState(e.target.value)}
          required
        />
        <label htmlFor="age">Enter your age:</label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => {
            const { value } = e.target
            setAgeState(value === '' ? '' : Number(value))
          }}
          required
        />
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={e => setDifficultyState(e.target.value as 'easy' | 'medium' | 'hard')}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button type="submit" className="btn-primary">Save</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/leaderboard">Return to Progress</Link>
      </p>
    </div>
  )
}
