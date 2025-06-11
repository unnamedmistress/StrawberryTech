import useSWR from 'swr'
import Link from 'next/link'
import Spinner from '../components/ui/Spinner'
import { getApiBase } from '../utils/api'

interface View {
  id: number
  visitorId: string | null
  user: string | null
  path: string
  referrer?: string
  agent?: string
  start: string
  end?: string
  duration?: number
}

export default function StatsPage() {

  const base = getApiBase()
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: views = [] } = useSWR<View[]>(
    base ? `${base}/api/views` : null,
    fetcher,
    { refreshInterval: 60000 }
  )

  const loading = views.length === 0


  const now = Date.now()
  const lastHour = now - 60 * 60 * 1000
  const lastDay = now - 24 * 60 * 60 * 1000
  const lastWeek = now - 7 * 24 * 60 * 60 * 1000
  const lastMonth = now - 30 * 24 * 60 * 60 * 1000

  const viewsLastHour = views.filter(v => new Date(v.start).getTime() >= lastHour).length
  const viewsLastDay = views.filter(v => new Date(v.start).getTime() >= lastDay).length
  const viewsLastWeek = views.filter(v => new Date(v.start).getTime() >= lastWeek).length
  const viewsLastMonth = views.filter(v => new Date(v.start).getTime() >= lastMonth).length

  const dayCounts = Array.from({ length: 7 }).map((_, i) => {
    const start = new Date(now - (6 - i) * 24 * 60 * 60 * 1000)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    return views.filter(v => {
      const t = new Date(v.start).getTime()
      return t >= start.getTime() && t < end.getTime()
    }).length
  })

  const uniqueVisitors = new Set(views.map(v => v.visitorId)).size
  const sessionViews = views.filter(v => typeof v.duration === 'number')
  const avgDuration = sessionViews.length
    ? Math.round(
        sessionViews.reduce((sum: number, v: View) => sum + (v.duration || 0), 0) /
          sessionViews.length /
          1000
      )
    : 0

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
      {loading ? (
        <Spinner />
      ) : (
        <>
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
            alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
            className="brand-logo"
            style={{ width: '48px' }}
          />
          <p>Total Views: {views.length}</p>
          <p>Unique Visitors: {uniqueVisitors}</p>
          <p>Average Session (s): {avgDuration}</p>
          <p>Views last hour: {viewsLastHour}</p>
          <p>Views last day: {viewsLastDay}</p>
          <p>Views last week: {viewsLastWeek}</p>
          <p>Views last month: {viewsLastMonth}</p>
          <svg width={chartWidth + 20} height={chartHeight + 20} aria-label="Views line chart">
            <polyline points={points} fill="none" stroke="blue" strokeWidth="2" />
          </svg>
        </>
      )}
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Site Statistics | StrawberryTech</title>
      <meta name="description" content="View visitor analytics collected by the server." />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/stats" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
