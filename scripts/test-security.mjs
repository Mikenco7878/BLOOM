import EmbeddedPostgres from 'embedded-postgres';
import { randomBytes } from 'node:crypto';
import { access, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';

await access('.next/BUILD_ID').catch(() => {
  throw new Error('Run npm run build before npm run test:security.');
});
const root = await realpath('.data').catch(async () => {
  await mkdir('.data', { recursive: true });
  return realpath('.data');
});
const directory = await mkdtemp(resolve(root, 'security-test-'));
const password = randomBytes(32).toString('hex');
async function freePort() {
  const server = createServer();
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  const port = server.address().port;
  await new Promise((accept) => server.close(accept));
  return port;
}
const databasePort = await freePort();
const webPort = await freePort();
const env = {
  ...process.env,
  DATABASE_URL: `postgresql://bloom_security:${password}@127.0.0.1:${databasePort}/bloom_security_test?schema=public`,
  SITE_URL: `http://localhost:${webPort}`,
  SESSION_SECRET: randomBytes(32).toString('hex'),
  STORAGE_PROVIDER: 'local',
  LOCAL_STORAGE_PATH: resolve(directory, 'uploads'),
  TRUST_PROXY: 'false',
  ADMIN_EMAIL: '',
  ADMIN_PASSWORD: '',
  BLOOM_SECURITY_TEST: '1',
  BLOOM_SECURITY_PORT: String(webPort),
};
const cluster = new EmbeddedPostgres({
  databaseDir: resolve(directory, 'postgres'),
  user: 'bloom_security',
  password,
  port: databasePort,
  persistent: true,
  authMethod: 'scram-sha-256',
  postgresFlags: ['-h', '127.0.0.1'],
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  autoRehydrateSymlinks: true,
  onLog: () => {},
  onError: () => {},
});
async function run(args) {
  const child = spawn(process.execPath, args, { env, stdio: 'inherit' });
  const code = await new Promise((accept, reject) => {
    child.once('error', reject);
    child.once('exit', accept);
  });
  if (code !== 0) throw new Error(`Security check exited with code ${code}.`);
}
let started = false;
try {
  await cluster.initialise();
  await cluster.start();
  started = true;
  await cluster.createDatabase('bloom_security_test');
  await run(['node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  await run(['prisma/seed.js']);
  await run(['node_modules/vitest/vitest.mjs', 'run']);
  await run([
    'node_modules/@playwright/test/cli.js',
    'test',
    '--config=playwright.security.config.js',
  ]);
} catch (error) {
  console.error('Security run failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  if (started) await cluster.stop();
  const target = await realpath(directory);
  if (!target.startsWith(root + sep) || !target.startsWith(resolve(root, 'security-test-')))
    throw new Error('Refusing cleanup outside the isolated security directory.');
  await rm(target, { recursive: true, force: true });
}
