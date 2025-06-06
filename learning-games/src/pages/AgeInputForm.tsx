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
  const { user, setAge, setName } = useContext(UserContext)
  const [age, setAgeState] = useState<number | ''>(user.age ?? '')
  const [name, setNameState] = useState(user.name ?? '')
  const navigate = useNavigate()

  // If age already exists and editing isn't allowed, redirect away
  useEffect(() => {
    if (user.age && !allowEdit) navigate('/')
  }, [user.age, navigate, allowEdit])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ageNumber = Number(age)
    if (!Number.isNaN(ageNumber) && ageNumber > 0) {
      setAge(ageNumber)
      if (name) setName(name)
      if (onSaved) {
        onSaved()
      } else {
        navigate('/')
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
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
