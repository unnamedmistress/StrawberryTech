import { vi, beforeAll } from 'vitest'

globalThis.alert = vi.fn()

beforeAll(() => {
  ;(import.meta.env as any).VITE_API_BASE = 'http://mock-api.local'
})
