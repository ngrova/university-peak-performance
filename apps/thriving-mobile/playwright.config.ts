import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, 'e2e', '.auth', 'user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: process.env['CI'] ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['iPhone 14'], browserName: 'chromium' },
    },
    {
      name: 'mobile-chrome',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run start --port 3002',
    port: 3002,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder-key',
    },
  },
});
