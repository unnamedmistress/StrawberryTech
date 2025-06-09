import type { NextApiRequest, NextApiResponse } from 'next'
import { posts } from '../../helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  const { id } = req.query
  const ref = posts.doc(String(id))
  const snap = await ref.get()
  if (snap.exists) {
    await ref.update({ flagged: true })
    res.status(200).json({ id, ...snap.data(), flagged: true })
  } else {
    res.status(404).end()
  }
}
