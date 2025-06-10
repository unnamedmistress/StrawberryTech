import type { NextApiRequest, NextApiResponse } from 'next'
import { views } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const snap = await views.get()
      const list: any[] = []
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }))
      res.status(200).json(list)
      return
    }    if (req.method === 'POST') {
      const view = {
        visitorId: req.body?.visitorId || null,
        user: req.body?.user || null,
        path: req.body?.path || '',
        referrer: req.body?.referrer || req.headers.referer || '',
        agent: req.body?.agent || req.headers['user-agent'] || '',
        ip: (req as any).ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        start: new Date().toISOString(),
      }
      
      const ref = await views.add(view)
      res.status(201).json({ id: ref.id, ...view })
      return
    }
    res.setHeader('Allow', 'GET, POST')
    res.status(405).end('Method Not Allowed')  } catch (error) {
    console.error('Views API Error:', error);
    res.status(500).json({
      error: 'Internal server error', 
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    })
  }
}
