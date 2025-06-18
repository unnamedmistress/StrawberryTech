import type { AgeGroup } from '../../../shared/getAgeGroup'

export async function generateRoomDescription(ageGroup: AgeGroup): Promise<string> {
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
              `You create short, vivid scene descriptions for an escape room game that a ${ageGroup} player would understand. Keep it under 20 words.`,
          },
          { role: 'user', content: 'Describe the next room the player enters.' },
        ],
        max_tokens: 40,
        temperature: 0.7,
      }),
    })
    const data = await resp.json()
    const text: string | undefined = data?.choices?.[0]?.message?.content?.trim()
    if (text) {
      return text
    }
  } catch (err) {
    console.error(err)
  }
  return 'A dim corridor leads to a chamber smelling of old parchment.'
}
