import type { NextApiRequest, NextApiResponse } from 'next'
import { prompts, moderateContent } from './helpers'

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
    
    if (!text.trim()) {
      res.status(400).json({ error: 'Prompt text is required.' })
      return
    }

    // Enhanced moderation with child safety checks
    const moderation = await moderateContent(text, 'prompt')
    
    if (!moderation.approved) {
      res.status(400).json({ 
        error: 'Your message was filtered, try again.',
        reason: moderation.reason 
      })
      return
    }

    const created = new Date().toISOString()
    const ref = await prompts.add({ 
      text: moderation.sanitized, 
      category: moderation.category, 
      author: moderation.avatarName,
      created, 
      flagged: false 
    })
    
    res.status(201).json({ 
      id: ref.id, 
      text: moderation.sanitized, 
      category: moderation.category,
      author: moderation.avatarName, 
      created, 
      flagged: false 
    })
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
