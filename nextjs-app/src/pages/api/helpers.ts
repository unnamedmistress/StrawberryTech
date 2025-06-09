import type { NextApiRequest } from 'next'
import path from 'path'
import fs from 'fs'
import firestore from '../../utils/firebase'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export const posts = firestore.collection('posts')
export const pairs = firestore.collection('pairs')
export const views = firestore.collection('views')
export const scores = firestore.collection('scores')
export const userDoc = firestore.collection('config').doc('user')

export const DARTS_FILE = path.join(process.cwd(), 'server', 'darts.json')

export function loadDartRounds() {
  try {
    const rounds = JSON.parse(fs.readFileSync(DARTS_FILE, 'utf8'))
    for (let i = rounds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rounds[i], rounds[j]] = [rounds[j], rounds[i]]
    }
    return rounds
  } catch {
    return []
  }
}

export async function analyzeSentiment(text: string): Promise<number> {
  if (!OPENAI_API_KEY) return 0
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Return only a number between -1 and 1 indicating how positive the sentiment is.',
          },
          { role: 'user', content: text.slice(0, 200) },
        ],
        max_tokens: 1,
      }),
    })
    const data = await resp.json()
    const val = parseFloat(
      data?.choices?.[0]?.message?.content?.trim().split(/\s+/)[0] || '0'
    )
    return Number.isNaN(val) ? 0 : val
  } catch (err) {
    console.error('Sentiment request failed', err)
    return 0
  }
}

export async function sanitizeComment(text: string): Promise<{ sanitized: string; alias: string }> {
  if (!OPENAI_API_KEY) {
    const withoutAge = text.replace(/\b\d{1,3}\b/g, '')
    return { sanitized: withoutAge.trim(), alias: 'Guest' }
  }
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Remove names, ages and personal identifiers from the text. Provide a short friendly alias summarizing the tone. Respond only in JSON with keys "sanitized" and "alias".',
          },
          { role: 'user', content: text.slice(0, 300) },
        ],
        max_tokens: 60,
        temperature: 0.4,
      }),
    })
    const data = await resp.json()
    let result: { sanitized: string; alias: string } = { sanitized: text, alias: 'Guest' }
    try {
      result = JSON.parse(data?.choices?.[0]?.message?.content || '')
    } catch {}
    if (!result.sanitized) result.sanitized = text
    if (!result.alias) result.alias = 'Guest'
    return result
  } catch (err) {
    console.error('Sanitize request failed', err)
    return { sanitized: text, alias: 'Guest' }
  }
}
