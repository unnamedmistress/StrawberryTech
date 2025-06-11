import type { NextApiRequest, NextApiResponse } from 'next'
import { posts, moderateContent, analyzeSentiment } from './helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const snap = await posts.where('status', '==', 'approved').get()
    const list: any[] = []
    snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }))
    res.status(200).json(list)
    return
  }

  if (req.method === 'POST') {
    const content = (req.body?.content || '') as string
    
    if (!content.trim()) {
      res.status(400).json({ error: 'Content is required.' })
      return
    }

    // Enhanced moderation with child safety checks
    const moderation = await moderateContent(content, 'post')
    
    if (!moderation.approved) {
      res.status(400).json({ 
        error: 'Your message was filtered, try again.',
        reason: moderation.reason 
      })
      return
    }

    // Additional sentiment check for positivity
    const score = await analyzeSentiment(moderation.sanitized)
    if (score < -0.1) {
      res.status(400).json({ error: 'Your message was filtered, try again. Please keep comments positive and constructive.' })
      return
    }

    const now = new Date().toISOString()
    const docRef = await posts.add({
      author: moderation.avatarName,
      content: moderation.sanitized,
      category: moderation.category,
      date: now,
      sentiment: score,
      status: 'approved',
    })
    
    const post = { 
      id: docRef.id, 
      author: moderation.avatarName, 
      content: moderation.sanitized, 
      category: moderation.category,
      date: now, 
      sentiment: score, 
      status: 'approved' 
    }
    res.status(201).json(post)
    return
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
