import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export const DEMO_AUTH_FILE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/demo.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  outputDir: 'demo-results',

  use: {
    baseURL: 'http://localhost:3001',
    headless: false,          // browser visível
    launchOptions: { slowMo: 700 }, // cada ação com 700 ms de pausa — legível em GIF
    viewport: { width: 1280, height: 800 },
    video: 'on',              // grava .webm de cada teste
    screenshot: 'on',
    storageState: DEMO_AUTH_FILE,
  },

  projects: [
    {
      name: 'demo-setup',
      testMatch: '**/global-setup.ts',
      use: { storageState: undefined },
    },
    {
      name: 'demo',
      dependencies: ['demo-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: DEMO_AUTH_FILE,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
