/**
 * tests/e2e/platform-modal.spec.ts
 *
 * Simula o comportamento do usuário ao clicar nos cards da seção
 * "A Plataforma Govevia" e verificar a abertura do modal de detalhe.
 */

import { test, expect, Page } from '@playwright/test'

const MODULES = [
  { title: 'Governança de Processos',              expectHeading: 'Funcionalidades', expectValue: 'conformidade deixa de ser reativa' },
  { title: 'Controle de Prazos e Alertas',         expectHeading: 'Funcionalidades', expectValue: 'Zero perda de prazo' },
  { title: 'Trilha de Auditoria Imutável',         expectHeading: 'Funcionalidades', expectValue: 'seguro de vida' },
  { title: 'Delegação com Competência Verificada', expectHeading: 'Funcionalidades', expectValue: 'medo número 1' },
  { title: 'Documentação Técnica Estruturada',     expectHeading: 'Funcionalidades', expectValue: 'Memória institucional' },
  { title: 'Relatórios para Controle Externo',     expectHeading: 'Funcionalidades', expectValue: 'auditoria especial' },
]

async function scrollToSection(page: Page) {
  await page.locator('#plataforma').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
}

// h3 é filho direto do card div — sobe 1 nível
function cardLocator(page: Page, title: string) {
  return page.locator('#plataforma h3').filter({ hasText: title }).locator('..')
}

// ─── Desktop ─────────────────────────────────────────────────────────────────

test.describe('Platform Modal — Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await scrollToSection(page)
  })

  test('seção visível com 6 cards clicáveis e hint "Clique para ler"', async ({ page }) => {
    const section = page.locator('#plataforma')
    await expect(section).toBeVisible()
    const cards = section.locator('.cursor-pointer')
    await expect(cards).toHaveCount(6)
    for (const card of await cards.all()) {
      await expect(card.getByText('Clique para ler')).toBeVisible()
    }
  })

  for (const mod of MODULES) {
    test(`[${mod.title}] — clique abre modal`, async ({ page }) => {
      await cardLocator(page, mod.title).click()

      const modal = page.locator('.fixed.inset-0')
      await expect(modal).toBeVisible({ timeout: 4000 })

      // Título correto
      await expect(modal.getByRole('heading', { name: mod.title })).toBeVisible()

      // Seção Funcionalidades presente
      await expect(modal.getByText('Funcionalidades').first()).toBeVisible()

      // Valor percebido
      await expect(modal.getByText(mod.expectValue, { exact: false }).first()).toBeVisible()

      // Label "Valor percebido"
      await expect(modal.getByText('Valor percebido', { exact: false }).first()).toBeVisible()
    })

    test(`[${mod.title}] — fecha pelo botão ×`, async ({ page }) => {
      await cardLocator(page, mod.title).click()
      const modal = page.locator('.fixed.inset-0')
      await expect(modal).toBeVisible({ timeout: 4000 })
      await modal.getByRole('button', { name: 'Fechar' }).click()
      await expect(modal).not.toBeVisible({ timeout: 3000 })
    })

    test(`[${mod.title}] — fecha clicando no backdrop`, async ({ page }) => {
      await cardLocator(page, mod.title).click()
      const modal = page.locator('.fixed.inset-0')
      await expect(modal).toBeVisible({ timeout: 4000 })
      await page.mouse.click(30, 30)
      await expect(modal).not.toBeVisible({ timeout: 3000 })
    })
  }

  test('body.overflow=hidden aberto, vazio ao fechar', async ({ page }) => {
    await cardLocator(page, 'Trilha de Auditoria Imutável').click()
    const modal = page.locator('.fixed.inset-0')
    await expect(modal).toBeVisible({ timeout: 4000 })

    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await modal.getByRole('button', { name: 'Fechar' }).click()
    await expect(modal).not.toBeVisible({ timeout: 3000 })
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  })

  test('apenas 1 modal aberto por vez', async ({ page }) => {
    await cardLocator(page, 'Governança de Processos').click()
    await expect(page.locator('.fixed.inset-0')).toHaveCount(1)
  })
})

// ─── Mobile (viewport iPhone 14 + hasTouch) ──────────────────────────────────

test.describe('Platform Modal — Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await scrollToSection(page)
  })

  test('6 cards visíveis no mobile', async ({ page }) => {
    await expect(page.locator('#plataforma .cursor-pointer')).toHaveCount(6)
  })

  for (const mod of MODULES.slice(0, 3)) {
    test(`[mobile] [${mod.title}] tap abre bottom-sheet`, async ({ page }) => {
      await cardLocator(page, mod.title).tap()

      const modal = page.locator('.fixed.inset-0')
      await expect(modal).toBeVisible({ timeout: 4000 })
      await expect(modal.getByRole('heading', { name: mod.title })).toBeVisible()

      // Handle mobile (barra no topo do painel)
      await expect(modal.locator('.w-10.h-1.rounded-full')).toBeVisible()
    })

    test(`[mobile] [${mod.title}] painel rolável — todo conteúdo acessível`, async ({ page }) => {
      await cardLocator(page, mod.title).tap()
      const panel = page.locator('.fixed.inset-0 .overflow-y-auto')
      await expect(panel).toBeVisible({ timeout: 4000 })

      // Rola até o fim
      await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight))
      await expect(
        page.locator('.fixed.inset-0').getByText(mod.expectValue, { exact: false }).first()
      ).toBeVisible()
    })

    test(`[mobile] [${mod.title}] fecha pelo botão ×`, async ({ page }) => {
      await cardLocator(page, mod.title).tap()
      const modal = page.locator('.fixed.inset-0')
      await expect(modal).toBeVisible({ timeout: 4000 })
      await modal.getByRole('button', { name: 'Fechar' }).tap()
      await expect(modal).not.toBeVisible({ timeout: 3000 })
    })
  }
})
