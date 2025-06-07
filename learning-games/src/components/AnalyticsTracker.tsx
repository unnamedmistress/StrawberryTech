import { useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function AnalyticsTracker() {
  const location = useLocation()
  const { user } = useContext(UserContext)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.name, path: location.pathname }),
      }).catch(() => {})
    }
  }, [location, user.name])

  return null
}
