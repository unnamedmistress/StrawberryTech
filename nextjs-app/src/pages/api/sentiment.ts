import type { NextApiRequest, NextApiResponse } from 'next'
import { analyzeSentiment } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const text = (req.body?.text || '') as string
  const score = await analyzeSentiment(text)
  res.status(200).json({ score })
}
