import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

/**
 * Form for collecting the user's age. Age is stored in context
 * and later used to customize game content by age group.
 */
export default function AgeInputForm() {
  const { user, setAge } = useContext(UserContext)
  const [age, setAgeState] = useState<number | ''>(user.age ?? '')
  const navigate = useNavigate()

  // If age already exists, go straight to the game selection page
  useEffect(() => {
    if (user.age) navigate('/')
  }, [user.age, navigate])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ageNumber = Number(age)
    if (ageNumber >= 12 && ageNumber <= 18) {
      setAge(ageNumber)
      navigate('/')
    } else {
      alert('Age must be between 12 and 18')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="age">Enter your age:</label>
      <input
        id="age"
        type="number"
        min={12}
        max={18}
        value={age}
        onChange={(e) => {
          const { value } = e.target
          setAgeState(value === '' ? '' : Number(value))
        }}
        required
      />
      <button type="submit">Save Age</button>
    </form>
  )
}
