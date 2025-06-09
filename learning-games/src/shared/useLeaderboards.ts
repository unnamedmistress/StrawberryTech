import { useEffect, useState } from 'react'

export interface PointsEntry {
  id?: string
  name: string
  points: number
}

export type LeaderboardData = Record<string, PointsEntry[]>

function getApiBase(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) {
    return (import.meta as any).env.VITE_API_BASE as string
  }
  return ''
}

let cachedData: LeaderboardData | null = null
let fetchPromise: Promise<LeaderboardData> | null = null

export function useLeaderboards() {
  const [data, setData] = useState<LeaderboardData | null>(cachedData)
  const [loading, setLoading] = useState(!cachedData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cachedData) return

    if (!fetchPromise) {
      const base = getApiBase()
      fetchPromise = fetch(`${base}/api/scores`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch scores')
          return res.json()
        })
        .then(json => {
          cachedData = json
          return json
        })
    }

    fetchPromise
      .then(json => setData(json))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
