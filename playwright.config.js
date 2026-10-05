import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: process.env.SITE_URL || 'http://127.0.0.1:8081' },
  webServer: process.env.SITE_URL ? undefined : {
    command: 'npm run preview',
    env: { PORT: '8081' },
    url: 'http://127.0.0.1:8081',
  },
});
