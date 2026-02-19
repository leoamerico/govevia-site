/**
 * tests/e2e/api.spec.ts
 *
 * Testa as rotas de API diretamente (usando request context autenticado
 * via storageState).
 */
import { test, expect } from '@playwright/test'

test.describe('API — healthz', () => {
  test('GET /api/healthz retorna 200', async ({ request }) => {
    const res = await request.get('/api/healthz')
    expect(res.status()).toBe(200)
  })
})

test.describe('API — kernel ping', () => {
  test('GET /api/admin/kernel/ping retorna 200 ou 5xx', async ({ request }) => {
    const res = await request.get('/api/admin/kernel/ping')
    // 200: backend respondeu; 502: proxy error; 503: não configurado
    expect([200, 502, 503]).toContain(res.status())
    const body = await res.json()
    expect(body).toHaveProperty('ok')
    expect(body).toHaveProperty('mode')
  })

  test('GET /api/admin/kernel/ping — campo mode é "live" ou "stub"', async ({ request }) => {
    const res = await request.get('/api/admin/kernel/ping')
    const body = await res.json()
    expect(['live', 'stub']).toContain(body.mode)
  })
})

test.describe('API — semantic search', () => {
  test('POST /api/admin/documents/search com query vazia retorna 400', async ({ request }) => {
    const res = await request.post('/api/admin/documents/search', {
      data: { query: '' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  test('POST /api/admin/documents/search com body inválido retorna 400', async ({ request }) => {
    const res = await request.post('/api/admin/documents/search', {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/admin/documents/search retorna chunks (real ou stub)', async ({ request }) => {
    const res = await request.post('/api/admin/documents/search', {
      data: { query: 'governança pública compliance', top_k: 3 },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('chunks')
    expect(body).toHaveProperty('kernelAvailable')
    expect(Array.isArray(body.chunks)).toBe(true)
  })

  test('POST /api/admin/documents/search — cada chunk tem os campos obrigatórios', async ({ request }) => {
    const res = await request.post('/api/admin/documents/search', {
      data: { query: 'teste e2e playwright' },
    })
    const body = await res.json()
    // Stub ou real — ambos devem ter a estrutura ChunkResult
    for (const chunk of body.chunks as Record<string, unknown>[]) {
      expect(chunk).toHaveProperty('chunk_id')
      expect(chunk).toHaveProperty('document_id')
      expect(chunk).toHaveProperty('score')
      expect(chunk).toHaveProperty('excerpt')
    }
  })
})

test.describe('API — task dispatch', () => {
  test('POST /api/admin/kernel/task/dispatch retorna 2xx ou 5xx', async ({ request }) => {
    const res = await request.post('/api/admin/kernel/task/dispatch', {
      data: { handler: 'ping', payload: { from: 'playwright-e2e' } },
    })
    // 200/202 = task aceita; 502/503 = backend offline (aceitável)
    expect([200, 202, 502, 503]).toContain(res.status())
  })
})

test.describe('API — normas legais', () => {
  test('GET /api/admin/legislacao retorna 200 ou 502/503', async ({ request }) => {
    const res = await request.get('/api/admin/legislacao')
    expect([200, 502, 503]).toContain(res.status())
    if (res.status() === 200) {
      const body = await res.json()
      // Pode ser array ou { items, total }
      expect(body).toBeTruthy()
    }
  })
})

test.describe('API — chat RAG', () => {
  test('POST /api/admin/chat com message vazia retorna 400', async ({ request }) => {
    const res = await request.post('/api/admin/chat', {
      data: { message: '' },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/admin/chat sem body retorna 400', async ({ request }) => {
    const res = await request.post('/api/admin/chat', {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/admin/chat retorna answer e kernel_available', async ({ request }) => {
    const res = await request.post('/api/admin/chat', {
      data: { message: 'O que é o princípio da legalidade?' },
    })
    // 200 = resposta real ou stub; 4xx apenas se validação falhar
    expect([200]).toContain(res.status())
    const body = await res.json() as Record<string, unknown>
    expect(typeof body.answer).toBe('string')
    expect((body.answer as string).length).toBeGreaterThan(0)
    expect(typeof body.kernel_available).toBe('boolean')
    expect(Array.isArray(body.sources)).toBe(true)
  })

  test('POST /api/admin/chat aceita histórico de mensagens', async ({ request }) => {
    const res = await request.post('/api/admin/chat', {
      data: {
        message: 'Pode repetir?',
        history: [
          { role: 'user', content: 'O que é licitação?' },
          { role: 'assistant', content: 'Licitação é um procedimento administrativo...' },
        ],
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(typeof body.answer).toBe('string')
  })
})
