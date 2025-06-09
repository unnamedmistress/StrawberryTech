import type { NextApiRequest, NextApiResponse } from 'next'
import { views } from '../../helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  const { id } = req.query
  const ref = views.doc(String(id))
  const snap = await ref.get()
  if (!snap.exists) {
    res.status(404).end()
    return
  }
  const view = snap.data() as any
  const end = new Date().toISOString()
  const duration = Number(view.duration || Date.now() - new Date(view.start).getTime())
  await ref.update({ end, duration })
  res.status(200).json({ id, ...view, end, duration })
}
