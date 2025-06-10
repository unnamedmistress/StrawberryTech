import type { NextApiRequest, NextApiResponse } from 'next'
import { scores } from '../helpers'

interface ScoreEntry {
  name: string
  score: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  const { game } = req.query
  const docRef = scores.doc(String(game))
  const snap = await docRef.get()
  let entries: ScoreEntry[] = snap.exists ? (snap.data()?.entries || []) : []
  const entry: ScoreEntry = {
    name: req.body?.name || 'Anonymous',
    score: Number(req.body?.score) || 0,
  }
  entries.push(entry)
  entries.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score)
  entries = entries.slice(0, 10)
  await docRef.set({ entries })
  res.status(200).json(entries)
}
