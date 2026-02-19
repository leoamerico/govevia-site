/**
 * tests/e2e/admin.spec.ts
 *
 * Testa as páginas do painel admin (requer autenticação — usa storageState).
 */
import { test, expect } from '@playwright/test'

test.describe('Painel Admin — navegação', () => {
  test('GET /admin redireciona para /admin/login (comportamento esperado)', async ({ page }) => {
    // /admin/page.tsx faz redirect() para /admin/login — mesmo autenticado
    // O acesso ao painel é via rotas filhas (ex: /admin/rag, /admin/legislacao)
    const res = await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    // Aceita 200 (login page renderizada) após redirect no servidor
    expect([200, 307, 308]).toContain(res?.status() ?? 200)
    // Deve terminar em /admin/login
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('/admin/rag carrega a página RAG Demo', async ({ page }) => {
    const res = await page.goto('/admin/rag', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    // Página deve ter algum heading ou conteúdo visível
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/legislacao carrega a página de normas legais', async ({ page }) => {
    const res = await page.goto('/admin/legislacao', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/bpmn carrega o editor BPMN', async ({ page }) => {
    const res = await page.goto('/admin/bpmn', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/pi carrega o módulo de Propriedade Intelectual', async ({ page }) => {
    const res = await page.goto('/admin/pi', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/ops carrega o log de eventos', async ({ page }) => {
    const res = await page.goto('/admin/ops', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/rules carrega o playground de regras', async ({ page }) => {
    const res = await page.goto('/admin/rules', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/admin/control-plane carrega o painel de controle', async ({ page }) => {
    const res = await page.goto('/admin/control-plane', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('logout — POST /api/admin/logout limpa o cookie', async ({ request }) => {
    // Testa via API diretamente — verifica que a rota existe e retorna 200
    // (o storageState é compartilhado, não podemos testar redirect no mesmo contexto)
    const res = await request.post('/api/admin/logout')
    expect([200, 204]).toContain(res.status())
  })
})
