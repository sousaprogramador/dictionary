import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run build && npm start',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      env: {
        API_URL: process.env.API_URL || 'http://localhost:3000',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
      },
    },
  ],
  timeout: 60_000,
});
