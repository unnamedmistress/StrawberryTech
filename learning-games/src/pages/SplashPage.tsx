import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import './SplashPage.css'

export default function SplashPage() {
  const { user, setUser } = useContext(UserContext)
  const [name, setName] = useState(user.name ?? '')
  const [age, setAge] = useState<number | ''>(user.age ?? '')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.age) {
      navigate('/games/match3')
    }
  }, [user.age, navigate])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ageNum = Number(age)
    if (ageNum < 12 || ageNum > 18) {
      alert('Age must be between 12 and 18')
      return
    }
    setUser({ ...user, name, age: ageNum })
    navigate('/games/match3')
  }

  return (
    <div className="splash-container">
      <video autoPlay loop muted className="bg-video">
        <source src="/welcome.mp4" type="video/mp4" />
      </video>
      <div className="overlay">
        <h1>Welcome to StrawberryTech! 🍓</h1>
        <p>Play while you learn.</p>
        <form onSubmit={handleSubmit} className="start-form">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min={12}
            max={18}
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            required
          />
          <button type="submit">Start Playing</button>
        </form>
      </div>
    </div>
  )
}
