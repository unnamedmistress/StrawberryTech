import type { NextApiRequest, NextApiResponse } from 'next'
import { scores } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
    return
  }

  const snap = await scores.get()
  const data: Record<string, any[]> = {}
  snap.forEach(doc => (data[doc.id] = doc.data().entries || []))
  res.status(200).json(data)
}
