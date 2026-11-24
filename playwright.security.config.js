import { defineConfig } from '@playwright/test';

if (process.env.BLOOM_SECURITY_TEST !== '1')
  throw new Error('Run npm run test:security to use the isolated security database.');

export default defineConfig({
  testDir: './tests/security',
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  outputDir: '.data/security-results',
  use: { baseURL: process.env.SITE_URL, trace: 'off' },
  webServer: {
    command: `node node_modules/next/dist/bin/next start --port ${process.env.BLOOM_SECURITY_PORT} --hostname 127.0.0.1`,
    url: process.env.SITE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
