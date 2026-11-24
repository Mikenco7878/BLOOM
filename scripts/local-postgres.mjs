import EmbeddedPostgres from 'embedded-postgres';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

// An isolated, persistent PostgreSQL cluster. Never connects to or resets another DB.
const dataDirectory = resolve('.data');
await mkdir(dataDirectory, { recursive: true });
const credentialPath = resolve(dataDirectory, 'local-db.json');
let config;
try {
  config = JSON.parse(await readFile(credentialPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  config = { user: 'bloom', password: randomBytes(32).toString('hex'), port: 55432 };
  await writeFile(credentialPath, JSON.stringify(config), { mode: 0o600, flag: 'wx' });
}
const databaseUrl = `postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/bloom?schema=public`;
try {
  await access('.env');
} catch {
  await writeFile(
    '.env',
    [
      `DATABASE_URL=${databaseUrl}`,
      'SITE_URL=http://localhost:3000',
      `SESSION_SECRET=${randomBytes(32).toString('hex')}`,
      'STORAGE_PROVIDER=local',
      'LOCAL_STORAGE_PATH=.data/uploads',
      'ADMIN_EMAIL=',
      'ADMIN_PASSWORD=',
      'TRUST_PROXY=false',
      '',
    ].join('\n'),
    { mode: 0o600, flag: 'wx' },
  );
  console.log('Created ignored .env with random local credentials. No admin account created.');
}
const cluster = new EmbeddedPostgres({
  databaseDir: resolve(dataDirectory, 'postgres'),
  user: config.user,
  password: config.password,
  port: config.port,
  persistent: true,
  authMethod: 'scram-sha-256',
  postgresFlags: ['-h', '127.0.0.1'],
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  autoRehydrateSymlinks: true,
  onLog: () => {},
  onError: () => {},
});
try {
  await access(resolve(dataDirectory, 'postgres/PG_VERSION'));
} catch {
  await cluster.initialise();
}
await cluster.start();
const client = cluster.getPgClient();
await client.connect();
const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = 'bloom'");
await client.end();
if (!exists.rowCount) await cluster.createDatabase('bloom');
console.log(`Local PostgreSQL ready on 127.0.0.1:${config.port}. Data persists in .data/postgres.`);
console.log('Next: npm run db:migrate, npm run db:seed, npm run admin:create, npm run dev.');
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await cluster.stop();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
setInterval(() => {}, 60_000);
