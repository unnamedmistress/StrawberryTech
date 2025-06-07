import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AgeInputForm from './AgeInputForm'
import { UserContext } from '../context/UserContext'
import ThemeToggle from '../components/layout/ThemeToggle'

export default function ProfilePage() {
  const { user, setName } = useContext(UserContext)
  const [name, setNameState] = useState(user.name ?? '')
  const navigate = useNavigate()

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setName(name)
    navigate('/leaderboard')
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Edit Profile</h2>
      <img
        src="https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif"
        alt="Profile animation"
        style={{ width: '120px', marginBottom: '1rem' }}
      />
      <form onSubmit={handleSaveName} style={{ marginBottom: '1rem' }}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setNameState(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />

        <button type="submit" className="btn-primary" style={{ marginLeft: '0.5rem' }}>Save Name</button>

      </form>
      <AgeInputForm allowEdit onSaved={() => navigate('/leaderboard')} />
      <div style={{ marginTop: '1rem' }}>
        <span style={{ marginRight: '0.5rem' }}>High Contrast Mode:</span>
        <ThemeToggle />
      </div>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/leaderboard">Return to Progress</Link>
      </p>
    </div>
  )
}
