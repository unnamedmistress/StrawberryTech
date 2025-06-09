import type { NextApiRequest, NextApiResponse } from 'next'
import { pairs } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const snap = await pairs.get()
    const list: any[] = []
    snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }))
    res.status(200).json(list)
    return
  }

  if (req.method === 'POST') {
    const pair = { bad: req.body?.bad || '', good: req.body?.good || '' }
    const ref = await pairs.add(pair)
    res.status(201).json({ id: ref.id, ...pair })
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
