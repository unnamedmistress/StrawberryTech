import { useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../shared/UserContext'
import type { UserContextType } from '../../../shared/types/user'
import { getApiBase } from '../utils/api'

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
}

export default function AnalyticsTracker() {
  const location = useLocation()
  const { user } = useContext(UserContext) as UserContextType

  useEffect(() => {
    if (typeof window === 'undefined') return
    const base = getApiBase()
    let visitorId = getCookie('uid')
    if (!visitorId) {
      visitorId = Math.random().toString(36).slice(2)
      setCookie('uid', visitorId, 365)
    }
    const referrer = document.referrer
    const agent = navigator.userAgent
    let viewId: number | undefined
    const startTime = Date.now()

    fetch(`${base}/api/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: user.name,
        path: location.pathname,
        visitorId,
        referrer,
        agent,
      }),
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.id) viewId = data.id
      })
      .catch(() => {})

    const endSession = () => {
      if (!viewId) return
      const payload = {
        endTime: Date.now(),
        duration: Date.now() - startTime,
      }
      navigator.sendBeacon(
        `${base}/api/views/${viewId}/end`,
        JSON.stringify(payload)
      )
    }

    window.addEventListener('beforeunload', endSession)
    return () => {
      endSession()
      window.removeEventListener('beforeunload', endSession)
    }
  }, [location, user.name])

  return null
}
