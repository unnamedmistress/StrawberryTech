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
      
      // Test with minimal data first
      const view = {
        path: req.body?.path || '/test',
        ip: 'unknown',
        start: new Date().toISOString(),
      }
      
      console.log('Minimal view object:', view)
      
      try {
        const ref = await views.add(view)
        console.log('Successfully saved view with ID:', ref.id)
        res.status(201).json({ id: ref.id, ...view })
        return
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError)
        res.status(500).json({ 
          error: 'Firestore operation failed', 
          details: (firestoreError as Error).message,
          timestamp: new Date().toISOString()
        })
        return
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
