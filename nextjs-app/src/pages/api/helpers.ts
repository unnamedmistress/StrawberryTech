import type { NextApiRequest } from 'next'
import path from 'path'
import fs from 'fs'
import firestore from '../../utils/firebase'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export const posts = firestore.collection('posts')
export const prompts = firestore.collection('prompts')
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

export async function generateSillyAvatar(text: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    const fallbacks = ['CodeWizard', 'PixelPal', 'TechGuru', 'GameMaster', 'CreativeMind', 'BrainBot', 'QuizKing', 'PuzzlePro']
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
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
            content: 'Create a short, silly, avatar name using this content for inspiration. Make it playful and family-friendly. Return only the name, no quotes or explanation.',
          },
          { role: 'user', content: text.slice(0, 200) },
        ],
        max_tokens: 15,
        temperature: 0.8,
      }),
    })
    const data = await resp.json()
    const avatarName = data?.choices?.[0]?.message?.content?.trim() || 'CreativePal'
    return avatarName.replace(/['"]/g, '').slice(0, 20)
  } catch (err) {
    console.error('Avatar generation failed', err)
    const fallbacks = ['CodeWizard', 'PixelPal', 'TechGuru', 'GameMaster', 'CreativeMind']
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }
}

export async function moderateContent(
  text: string,
  type: 'post' | 'prompt'
): Promise<{ 
  approved: boolean; 
  reason?: string; 
  category: string; 
  sanitized: string;
  avatarName: string;
}> {
  if (!OPENAI_API_KEY) {
    const avatarName = await generateSillyAvatar(text)
    return { 
      approved: true, 
      category: 'general', 
      sanitized: text, 
      avatarName
    }
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
            content: `You are a content moderator for a family-friendly learning platform. Analyze this ${type} for:
1. Child safety - reject anything inappropriate for children (violence, adult content, harmful behavior)
2. Category classification - assign appropriate category
3. Content sanitization - remove personal info but keep the core message
4. Overall approval decision

Categories for posts: feedback, suggestion, question, review, general
Categories for prompts: Education, Business, Creative, Health, Technology, Entertainment, general

Respond only in JSON with keys: "approved" (boolean), "reason" (string if rejected), "category" (string), "sanitized" (string).`,
          },
          { role: 'user', content: text.slice(0, 500) },
        ],
        max_tokens: 150,
        temperature: 0.2,
      }),
    })

    const data = await resp.json()
    let result: any = { 
      approved: true, 
      category: 'general', 
      sanitized: text 
    }

    try {
      result = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    } catch {}

    // Ensure required fields
    if (typeof result.approved !== 'boolean') result.approved = true
    if (!result.category) result.category = 'general'
    if (!result.sanitized) result.sanitized = text
    
    // Generate silly avatar name
    const avatarName = await generateSillyAvatar(result.sanitized)
    
    return {
      approved: result.approved,
      reason: result.reason,
      category: result.category,
      sanitized: result.sanitized,
      avatarName
    }

  } catch (err) {
    console.error('Content moderation failed', err)
    const avatarName = await generateSillyAvatar(text)
    return { 
      approved: true, 
      category: 'general', 
      sanitized: text,
      avatarName
    }
  }
}

export async function moderatePrompt(
  text: string
): Promise<{ flagged: boolean; category: string }> {
  if (!OPENAI_API_KEY)
    return { flagged: false, category: 'general' }
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
              'Classify the text into a short category and indicate if it violates content policies. Respond only in JSON with keys "flagged" and "category".',
          },
          { role: 'user', content: text.slice(0, 300) },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    })
    const data = await resp.json()
    let result: { flagged: boolean; category: string } = {
      flagged: false,
      category: 'general',
    }
    try {
      result = JSON.parse(data?.choices?.[0]?.message?.content || '')
    } catch {}
    if (!result.category) result.category = 'general'
    return result
  } catch (err) {
    console.error('Moderation request failed', err)
    return { flagged: false, category: 'general' }
  }
}
