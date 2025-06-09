import type { NextApiRequest, NextApiResponse } from 'next'
import { posts, sanitizeComment, analyzeSentiment } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const snap = await posts.where('status', '==', 'approved').get()
    const list: any[] = []
    snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }))
    res.status(200).json(list)
    return
  }

  if (req.method === 'POST') {
    const content = (req.body?.content || '') as string
    const score = await analyzeSentiment(content)
    if (score < -0.1) {
      res.status(400).json({ error: 'Only positive feedback is allowed.' })
      return
    }
    const { sanitized, alias } = await sanitizeComment(content)
    const status = score <= 0.2 ? 'pending' : 'approved'
    const now = new Date().toISOString()
    const docRef = await posts.add({
      author: alias,
      content: sanitized,
      date: now,
      sentiment: score,
      status,
    })
    const post = { id: docRef.id, author: alias, content: sanitized, date: now, sentiment: score, status }
    res.status(status === 'approved' ? 201 : 202).json(post)
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
