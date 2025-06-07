import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserContext } from '../context/UserContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, setName, setAge } = useContext(UserContext)
  const [name, setNameState] = useState(user.name ?? '')
  const [age, setAgeState] = useState<string>(user.age ? String(user.age) : '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ageNum = Number(age)
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!age || Number.isNaN(ageNum) || ageNum <= 0) {
      toast.error('Age must be a valid number')
      return
    }
    setName(name.trim())
    setAge(ageNum)
    toast.success('Profile saved successfully!')
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
        <button type="submit">Save</button>
        <Link to="/leaderboard" className="return-link">
          Return to Progress
        </Link>
      </form>
    </div>
  )
}
