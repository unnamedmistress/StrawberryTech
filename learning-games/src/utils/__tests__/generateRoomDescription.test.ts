import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateRoomDescription } from '../generateRoomDescription'

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

describe('generateRoomDescription', () => {
  it('includes age group in system prompt', async () => {
    const mock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ choices: [{ message: { content: 'room' } }] }),
    })
    global.fetch = mock as typeof fetch
    await generateRoomDescription('teen')
    const body = JSON.parse(mock.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('teen')
  })
})
