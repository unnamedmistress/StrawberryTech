import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../shared/UserContext'
import './SplashPage.css'

export default function SplashPage() {
  const { user, setUser } = useContext(UserContext)
  const [name, setName] = useState(user.name ?? '')
  const [age, setAge] = useState<number | ''>(user.age ?? '')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.age) {
      navigate('/games/tone')
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
    navigate('/games/tone')
  }

  return (
    <div className="splash-container">
      <div className="overlay">
        <h1>Welcome to StrawberryTech! 🍓</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="hero-img"
        />
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
          <button type="submit" className="start-btn btn-primary">Begin Your Journey</button>
        </form>
      </div>
    </div>
  )
}
