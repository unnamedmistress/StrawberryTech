import type { NextApiRequest, NextApiResponse } from 'next'
import { userDoc } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const snap = await userDoc.get()
    res.status(200).json(
      snap.exists ? snap.data() : { name: null, age: null, badges: [], points: { darts: 0 } }
    )
    return
  }

  if (req.method === 'POST') {
    const snap = await userDoc.get()
    const user = { ...(snap.exists ? snap.data() : {}), ...req.body }
    await userDoc.set(user)
    res.status(200).json(user)
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
