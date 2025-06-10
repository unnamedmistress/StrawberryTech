import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Prevent alert dialogs during tests
globalThis.alert = vi.fn()

const server = setupServer(
  http.get('/api/user', () =>
    HttpResponse.json({ id: 'test-user', name: 'Tester' })
  ),
  http.get('/api/posts', () => HttpResponse.json([])),
  http.post('/api/posts', () => new HttpResponse(null, { status: 201 })),
  http.post('/api/posts/:id/flag', () => new HttpResponse(null, { status: 200 })),
  http.get('/api/scores', () => HttpResponse.json({})),
  http.post('/api/scores/:game', () => new HttpResponse(null, { status: 200 })),
  http.get('/api/views', () => HttpResponse.json([])),
  http.post('/api/views', () => HttpResponse.json({ id: 1 })),
  http.post('/api/views/:id/end', () => new HttpResponse(null, { status: 200 })),
  http.get('/api/progress', () => HttpResponse.json([])),
  http.get('/api/pairs', () => HttpResponse.json([])),
  http.post('/api/darts', () => HttpResponse.json({}))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

