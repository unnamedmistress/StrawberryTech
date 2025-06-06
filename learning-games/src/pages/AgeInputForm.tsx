import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
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
  const { user, setAge } = useContext(UserContext)
  const [age, setAgeState] = useState<number | ''>(user.age ?? '')
  const navigate = useNavigate()

  // If age already exists and editing isn't allowed, redirect away
  useEffect(() => {
    if (user.age && !allowEdit) navigate('/')
  }, [user.age, navigate, allowEdit])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ageNumber = Number(age)
    if (ageNumber >= 12 && ageNumber <= 18) {
      setAge(ageNumber)
      if (onSaved) {
        onSaved()
      } else {
        navigate('/')
      }
    } else {
      alert('Age must be between 12 and 18')
    }
  }

  return (
    <div className="age-form">
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
    </div>
  )
}
