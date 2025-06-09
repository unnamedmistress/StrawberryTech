import type { NextApiRequest, NextApiResponse } from 'next'
import { loadDartRounds } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
    return
  }

  const rounds = loadDartRounds()
  res.status(200).json(rounds)
}
