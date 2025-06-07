import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface ViewData {
  id: number
  user: string | null
  path: string
  timestamp: string
}

export default function StatsPage() {
  const [views, setViews] = useState<ViewData[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin
      fetch(`${base}/api/views`)
        .then(res => (res.ok ? res.json() : []))
        .then(data => setViews(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [])

  const now = Date.now()
  const lastHour = now - 60 * 60 * 1000
  const lastDay = now - 24 * 60 * 60 * 1000
  const lastWeek = now - 7 * 24 * 60 * 60 * 1000
  const lastMonth = now - 30 * 24 * 60 * 60 * 1000

  const viewsLastHour = views.filter(v => new Date(v.timestamp).getTime() >= lastHour).length
  const viewsLastDay = views.filter(v => new Date(v.timestamp).getTime() >= lastDay).length
  const viewsLastWeek = views.filter(v => new Date(v.timestamp).getTime() >= lastWeek).length
  const viewsLastMonth = views.filter(v => new Date(v.timestamp).getTime() >= lastMonth).length

  const dayCounts = Array.from({ length: 7 }).map((_, i) => {
    const start = new Date(now - (6 - i) * 24 * 60 * 60 * 1000)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    return views.filter(v => {
      const t = new Date(v.timestamp).getTime()
      return t >= start.getTime() && t < end.getTime()
    }).length
  })

  const chartWidth = 280
  const chartHeight = 80
  const max = Math.max(...dayCounts, 1)
  const points = dayCounts
    .map((c, i) => {
      const x = (i / (dayCounts.length - 1)) * chartWidth + 10
      const y = chartHeight - (c / max) * chartHeight + 10
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="stats-page">
      <h2>Site Statistics</h2>
      <p>Total Views: {views.length}</p>
      <p>Views last hour: {viewsLastHour}</p>
      <p>Views last day: {viewsLastDay}</p>
      <p>Views last week: {viewsLastWeek}</p>
      <p>Views last month: {viewsLastMonth}</p>
      <svg width={chartWidth + 20} height={chartHeight + 20} aria-label="Views line chart">
        <polyline points={points} fill="none" stroke="blue" strokeWidth="2" />
      </svg>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}
