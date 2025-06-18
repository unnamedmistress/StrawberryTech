import { notify } from '../shared/notify'

export type Slot = 'Action' | 'Context' | 'Format' | 'Constraints'

export interface Card {
  type: Slot
  text: string
}

export interface Dropped {
  Action: string | null
  Context: string | null
  Format: string | null
  Constraints: string | null
}

export function evaluateRecipe(dropped: Dropped, cards: Card[]) {
  let score = 0
  let perfect = true
  for (const card of cards) {
    if (dropped[card.type] === card.text) {
      score += 1
    } else {
      perfect = false
    }
  }
  return { score, perfect }
}

export function parseCardLines(text: string): string[] {
  const raw = text.split(/\r?\n/).map(l => l.trim())
  const lines: string[] = []
  const labels = ['Action', 'Context', 'Format', 'Constraints']

  for (let i = 0; i < raw.length; i++) {
    let line = raw[i]
    if (!line) continue

    line = line.replace(/^[-*\d.\s]+/, '')

    const labelIndex = labels.findIndex(
      l => line.toLowerCase() === l.toLowerCase(),
    )
    if (labelIndex !== -1) {
      while (++i < raw.length && !raw[i].trim()) {
        /* skip empty */
      }
      if (i < raw.length) {
        let next = raw[i].replace(/^[-*\d.\s]+/, '')
        next = next
          .replace(
            /^(Action|Context|Format|Constraints)[\s:.\-=]+/i,
            '',
          )
          .trim()
        if (next) lines.push(next)
      }
      continue
    }

    line = line
      .replace(
        /^(Action|Context|Format|Constraints)[\s:.\-=]+/i,
        '',
      )
      .trim()
    if (line) lines.push(line)
  }

  return lines
}

const ACTIONS = [
  'Writing a love letter',
  'Crafting a thank-you note',
  'Apologizing to a friend',
  'Congratulating a colleague',
  'Inviting someone to lunch',
]
const CONTEXTS = [
  "for Valentine's Day",
  'after a successful project',
  'on their birthday',
  'before a big exam',
  'for a wedding anniversary',
]
const FORMATS = [
  'handwritten on fancy stationery',
  'as a short text message',
  'in a playful poem',
  'in a formal email',
  'as a social media post',
]
const CONSTRAINTS = [
  'must be under 200 words',
  'include one emoji',
  'avoid mentioning work',
  'use a friendly tone',
  'limit to three sentences',
]

const CATEGORY_POOLS: Record<Slot, string[]> = {
  Action: ACTIONS,
  Context: CONTEXTS,
  Format: FORMATS,
  Constraints: CONSTRAINTS,
}

export function ensureCardSet(lines: string[]): Card[] {
  const categories: Slot[] = ['Action', 'Context', 'Format', 'Constraints']
  return categories.map((cat, idx) => ({
    type: cat,
    text:
      lines[idx] && lines[idx].trim()
        ? lines[idx].trim()
        : randomItem(CATEGORY_POOLS[cat]),
  }))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

import type { AgeGroup } from '../../../shared/getAgeGroup'

export async function generateCards(ageGroup: AgeGroup): Promise<Card[]> {
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              `Provide four short phrases for a ${ageGroup} player that clearly fit the labels Action, Context, Format and Constraints. Output exactly four lines in that order and prefix each line with the matching label followed by a colon. Example:\nAction: Write a thank you note\nContext: to a colleague\nFormat: as a short poem\nConstraints: under 50 words.`,
          },
          { role: 'user', content: 'Provide the labeled phrases.' },
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    })
    const data = await resp.json()
    const text: string | undefined = data?.choices?.[0]?.message?.content
    if (text) {
      const lines = parseCardLines(text)
      if (lines.length >= 4) {
        return ensureCardSet(lines)
      }
    }
  } catch (err) {
    console.error(err)
    notify('Unable to fetch new cards. Using defaults.')
  }
  return ensureCardSet([])
}

