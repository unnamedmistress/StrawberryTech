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
      console.log('POST /api/views - Starting request processing')
      console.log('Request body:', req.body)
      console.log('Firebase initialized:', !!views)
      
      const view = {
        visitorId: req.body?.visitorId || null,
        user: req.body?.user || null,
        path: req.body?.path || '',
        referrer: req.body?.referrer || req.headers.referer || '',
        agent: req.body?.agent || req.headers['user-agent'] || '',
        ip: (req as any).ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        start: new Date().toISOString(),
      }
      
      console.log('View object to save:', view)
      
      try {
        const ref = await views.add(view)
        console.log('Successfully saved view with ID:', ref.id)
        res.status(201).json({ id: ref.id, ...view })
        return
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError)
        throw new Error(`Firestore operation failed: ${(firestoreError as Error).message}`)
      }
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
