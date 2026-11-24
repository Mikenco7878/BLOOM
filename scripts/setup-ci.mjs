import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

if (!process.env.CI || !process.env.DATABASE_URL)
  throw new Error('For disposable CI environments only.');
await writeFile(
  '.env',
  [
    `DATABASE_URL=${process.env.DATABASE_URL}`,
    `SESSION_SECRET=${randomBytes(32).toString('hex')}`,
    'SITE_URL=http://localhost:3000',
    'STORAGE_PROVIDER=local',
    'TRUST_PROXY=false',
    '',
  ].join('\n'),
  { mode: 0o600, flag: 'wx' },
);
