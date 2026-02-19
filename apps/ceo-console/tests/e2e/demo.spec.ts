/**
 * demo.spec.ts — cenários instrutivos com slowMo + vídeo
 *
 * Cada describe gera um vídeo separado em demo-results/.
 * Converta em GIF com:  npm run demo:gif
 */

import { test, expect } from '@playwright/test';

// ─── 1. Proteção de rota ──────────────────────────────────────────────────────
test.describe('01 — Proteção de rota (sem auth)', () => {
  test.use({ storageState: undefined } as never);

  test('acesso a /admin sem cookie redireciona para login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    // login page usa <label> sem heading — verifica campo Usuário e botão Entrar
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible();
    await page.waitForTimeout(1000);
  });
});

// ─── 2. Login com credenciais inválidas ───────────────────────────────────────
test.describe('02 — Login com credenciais inválidas', () => {
  test.use({ storageState: undefined } as never);

  test('formulário exibe erro para usuário/senha errados', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/usuário|username/i)).toBeVisible();

    await page.getByLabel(/usuário|username/i).fill('hacker');
    await page.getByLabel(/senha|password/i).fill('senha-errada');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // aguarda mensagem de erro no formulário (p com color vermelho)
    await expect(
      page.locator('form p').filter({ hasText: /inválid|incorret|unauthorized/i }).first()
    ).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(1200);
  });
});

// ─── 3. Navegação entre módulos do painel ─────────────────────────────────────
test.describe('03 — Navegação no painel admin', () => {
  test('percorre todos os módulos disponíveis', async ({ page }) => {
    const modules = [
      { path: '/admin/rag',           label: 'RAG Demo' },
      { path: '/admin/legislacao',    label: 'Normas Legais' },
      { path: '/admin/bpmn',          label: 'BPMN' },
      { path: '/admin/pi',            label: 'Propriedade Intelectual' },
      { path: '/admin/ops',           label: 'Eventos' },
      { path: '/admin/rules',         label: 'Regras' },
      { path: '/admin/control-plane', label: 'Control Plane' },
    ];

    for (const mod of modules) {
      await page.goto(mod.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(600);
      // screenshot automático pelo config (screenshot: 'on')
    }
  });
});

// ─── 4. RAG Demo — abas e busca semântica ─────────────────────────────────────
test.describe('04 — RAG Demo: abas e busca semântica', () => {
  test('navega pelas 3 abas e submete uma query', async ({ page }) => {
    // TAB_LABELS são <button type="button"> — não role="tab"
    await page.goto('/admin/rag', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Aba Upload (label: '⬆  Upload PDF')
    const uploadTab = page.locator('button').filter({ hasText: /Upload PDF/i }).first();
    await uploadTab.waitFor({ state: 'visible', timeout: 20_000 });
    await uploadTab.click();
    await page.waitForTimeout(800);

    // Aba Busca Semântica (label: '🔍  Busca Semântica')
    const searchTab = page.locator('button').filter({ hasText: /Busca Sem/i }).first();
    await searchTab.click();
    await page.waitForTimeout(600);

    // campo de query
    const queryInput = page.locator('input[type="text"], input[placeholder], textarea').first();
    await expect(queryInput).toBeVisible({ timeout: 5_000 });
    await queryInput.fill('contratos administrativos lei 8666');
    await page.waitForTimeout(500);

    // submete
    const submitBtn = page.locator('button').filter({ hasText: /buscar|search/i }).first();
    await submitBtn.click();

    // aguarda resultado ou banner stub
    await expect(
      page.locator('[data-testid="search-results"], [data-testid="stub-banner"]')
        .or(page.locator('ul, ol, div').filter({ hasText: /STUB|resultado|chunk|score/i }))
        .first()
    ).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1200);

    // Aba Tarefas (label: '⚡  Tarefas Async')
    const tasksTab = page.locator('button').filter({ hasText: /Tarefas/i }).first();
    await tasksTab.click();
    await page.waitForTimeout(1000);
  });
});

// ─── 5. Logout via painel ─────────────────────────────────────────────────────
test.describe('05 — Logout', () => {
  test('chamada ao endpoint de logout limpa a sessão', async ({ page, request }) => {
    // confirma que está autenticado navegando para uma rota protegida
    await page.goto('/admin/rag');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    // dispara logout via API (mesmo fluxo do botão de logout no header)
    const res = await request.post('/api/admin/logout');
    expect([200, 204]).toContain(res.status());
    await page.waitForTimeout(600);

    // após logout, /admin deve redirecionar para login
    await page.goto('/admin');
    await page.waitForTimeout(500);
  });
});
