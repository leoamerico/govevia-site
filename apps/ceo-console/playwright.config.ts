import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config — CEO Console (porta 3001)
 *
 * Auth: global-setup gera JWT com o mesmo secret do .env.local,
 * injeta como cookie gv_admin_dev e salva o estado em playwright/.auth/user.json.
 * Todos os testes autenticados carregam esse estado.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // single worker — servidor Next.js compartilhado
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // sem headless: false para CI; mas aceita PWDEBUG=1 para debug local
    headless: true,
  },

  projects: [
    // Projeto de setup — gera playwright/.auth/user.json
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    // Testes autenticados
    {
      name: 'authenticated',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      testIgnore: /global-setup\.ts/,
    },
  ],

  // Inicia o servidor de desenvolvimento se não estiver rodando
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
