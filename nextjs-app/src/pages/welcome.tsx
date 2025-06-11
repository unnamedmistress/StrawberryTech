import { useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../shared/types/user'
import styles from '../styles/SplashPage.module.css'

export default function SplashPage() {
  const { user, setUser } = useContext(UserContext) as UserContextType
  const [name, setName] = useState(user.name ?? '')
  const [age, setAge] = useState<number | ''>(user.age ?? '')
  const navigate = useRouter()

  useEffect(() => {
    if (user.age) {
      navigate.push('/games/tone')
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
    navigate.push('/games/tone')
  }

  return (
    <div className={styles['splash-container']}>
      <div className={styles.overlay}>
        <h1>Welcome to StrawberryTech! 🍓</h1>
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
          alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
          className="hero-img"
        />
        <p>Play while you learn.</p>
        <form onSubmit={handleSubmit} className={styles['start-form']}>
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
          <button type="submit" className={`start-btn btn-primary ${styles['start-btn']}`}>Begin Your Journey</button>
        </form>
      </div>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Welcome | StrawberryTech</title>
      <meta name="description" content="Introduce yourself and start playing." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/welcome" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
