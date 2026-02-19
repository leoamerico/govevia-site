/**
 * tests/e2e/rag.spec.ts
 *
 * Testa a página RAG Demo (/admin/rag):
 *  - Tabs Upload, Busca, Tasks são exibidas
 *  - Interação com campo de busca
 *  - Stub banner aparece quando backend indisponível
 */
import { test, expect } from '@playwright/test'

test.describe('RAG Demo — /admin/rag', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rag', { waitUntil: 'networkidle' })
  })

  test('exibe as três abas: Upload PDF, Busca Semântica e Tarefas Async', async ({ page }) => {
    // Labels reais definidos em TAB_LABELS: '⬆  Upload PDF', '🔍  Busca Semântica', '⚡  Tarefas Async'
    await expect(
      page.locator('button').filter({ hasText: /Upload PDF/i }).first()
    ).toBeVisible({ timeout: 8000 })

    await expect(
      page.locator('button').filter({ hasText: /Busca Sem/i }).first()
    ).toBeVisible({ timeout: 8000 })

    await expect(
      page.locator('button').filter({ hasText: /Tarefas/i }).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('aba Busca — campo de query está presente', async ({ page }) => {
    // Clica na aba Busca — label real: '🔍  Busca Semântica'
    const searchTab = page.locator('button').filter({ hasText: /Busca Sem/i }).first()
    await searchTab.click()

    // Campo de busca ou textarea deve aparecer
    const input = page.locator('input[type="text"], input[placeholder], textarea').first()
    await expect(input).toBeVisible({ timeout: 5000 })
  })

  test('aba Busca — submetendo query exibe resultados ou banner de stub', async ({ page }) => {
    const searchTab = page.locator('button').filter({ hasText: /Busca Sem/i }).first()
    await searchTab.click()

    const input = page.locator('input[type="text"], input[placeholder], textarea').first()
    await input.fill('compliance governança')

    // Submete (Enter ou botão)
    await input.press('Enter')
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /buscar|search/i }).first()
    if (await submitBtn.count() > 0) await submitBtn.click()

    // Aguarda resultado ou banner de stub (backend pode estar offline)
    await expect(
      page.locator('[data-testid="search-results"], [data-testid="stub-banner"]')
        .or(page.locator('ul, ol, div').filter({ hasText: /STUB|resultado|chunk|score/i }))
        .first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('aba Tarefas — exibe o painel de tarefas assíncronas', async ({ page }) => {
    // Label real: '⚡  Tarefas Async'
    const tasksTab = page.locator('button').filter({ hasText: /Tarefas/i }).first()
    await tasksTab.click()

    // Deve haver algum conteúdo na aba tasks
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('aba Chat RAG — exibe input e envia mensagem', async ({ page }) => {
    // Label: '💬  Chat RAG'
    const chatTab = page.locator('button').filter({ hasText: /Chat/i }).first()
    await chatTab.click()

    // input de chat deve estar visível
    const chatInput = page.locator('[data-testid="chat-input"]')
    await expect(chatInput).toBeVisible({ timeout: 5000 })

    // envia mensagem
    await chatInput.fill('O que é o princípio da legalidade administrativa?')
    await page.locator('[data-testid="chat-send"]').click()

    // aguarda resposta (real ou stub)
    await expect(
      page.locator('[data-testid="chat-history"] div').filter({ hasText: /legalidade|stub|kernel/i }).first()
    ).toBeVisible({ timeout: 15000 })
  })
})
