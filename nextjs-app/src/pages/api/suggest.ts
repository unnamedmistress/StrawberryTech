import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const context = (req.query.context as string) || ''
  if (!context) return res.status(400).json({ error: 'Missing context' })
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    const fallback: Record<string, string[]> = {
      meeting: [
        'Could we meet Wednesday at 2 PM?',
        'Are you free Wednesday afternoon?',
        'Let me know if Wednesday works.'
      ],
      followup: [
        'Do you have any updates for me?',
        'Have you had a chance to review?',
        'Could you share your thoughts?'
      ],
      thankyou: [
        'Your quick help made a difference.',
        'Thanks again for your effort.',
        'I appreciate your support.'
      ],
      jobapp: [
        'I am excited to apply for this role.',
        'My background matches the position well.',
        'Attached is my resume for review.'
      ],
      support: [
        'I am experiencing an issue with my order.',
        'Could you assist with my problem?',
        'Please let me know what details you need.'
      ]
    }
    res.status(200).json({ suggestions: fallback[context] || [] })
    return
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Suggest three short, clear sentences for an email about ${context}. Separate each line with a newline.`
          }
        ],
        max_tokens: 60,
        temperature: 0.7
      })
    })
    const data = await resp.json()
    const text: string = data?.choices?.[0]?.message?.content || ''
    const suggestions = text
      .split(/\n+/)
      .map(t => t.trim().replace(/^[-\d.\s]+/, ''))
      .filter(Boolean)
    res.status(200).json({ suggestions })
  } catch (error) {
    console.error('suggest endpoint failed', error)
    res.status(500).json({ error: 'Failed to fetch suggestions' })
  }
}
