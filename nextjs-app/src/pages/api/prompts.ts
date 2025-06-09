import type { NextApiRequest, NextApiResponse } from 'next'
import { prompts } from './helpers'
import { sanitizeComment, moderatePrompt } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const snap = await prompts.where('flagged', '==', false).get()
    const list: any[] = []
    snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }))
    res.status(200).json(list)
    return
  }

  if (req.method === 'POST') {
    const text = (req.body?.text || '') as string
    const { sanitized } = await sanitizeComment(text)
    const { flagged, category } = await moderatePrompt(sanitized)
    if (flagged) {
      res.status(400).json({ error: 'Prompt rejected due to policy violation.' })
      return
    }
    const created = new Date().toISOString()
    const ref = await prompts.add({ text: sanitized, category, created, flagged })
    res.status(201).json({ id: ref.id, text: sanitized, category, created, flagged })
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
