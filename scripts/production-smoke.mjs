import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const origin = process.env.SITE_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('This smoke test is for an isolated local production build only.');
const database = new PrismaClient();
const credentials = {
  email: `qa-production-${randomBytes(6).toString('hex')}@example.invalid`,
  password: randomBytes(24).toString('hex'),
};
let actor;
try {
  for (const path of [
    '/',
    '/ve-bloom',
    '/san-pham',
    '/quy-trinh',
    '/phat-trien-ben-vung',
    '/hanh-trinh',
    '/du-an',
    '/lien-he',
    '/sitemap.xml',
    '/robots.txt',
  ]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    if (path === '/') assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  assert.equal((await fetch(`${origin}/not-a-published-bloom-page`)).status, 404);
  assert.equal((await fetch(`${origin}/api/v1/admin/dashboard`)).status, 401);
  assert.equal((await fetch(`${origin}/admin`, { redirect: 'manual' })).status, 307);
  actor = await database.adminUser.create({
    data: {
      email: credentials.email,
      passwordHash: await argon2.hash(credentials.password),
      name: 'Production smoke QA',
    },
  });
  const login = await fetch(`${origin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  assert.equal(login.status, 200);
  const header = login.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=lax'])
    assert.ok(header.toLowerCase().includes(flag.toLowerCase()), flag);
  const cookie = header.split(';')[0];
  const headers = { Cookie: cookie, Origin: origin };
  const dashboard = await fetch(`${origin}/api/v1/admin/dashboard`, { headers });
  assert.equal(dashboard.status, 200);
  const data = await dashboard.json();
  assert.equal(
    data.data.metrics.publishedPages,
    await database.page.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
  );
  assert.equal(
    (
      await fetch(`${origin}/api/v1/admin/settings`, {
        method: 'PATCH',
        headers: { ...headers, Origin: 'https://evil.example', 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: 'Rejected' }),
      })
    ).status,
    403,
  );
  assert.equal(
    (await fetch(`${origin}/api/v1/auth/logout`, { method: 'POST', headers })).status,
    200,
  );
  assert.equal((await fetch(`${origin}/api/v1/admin/dashboard`, { headers })).status, 401);
  console.log(
    'PASS: production public routes/SEO, 404, admin redirect, DB metrics, Secure session cookie, Origin rejection and logout.',
  );
} finally {
  if (actor) {
    await database.auditLog.deleteMany({ where: { adminUserId: actor.id } });
    await database.adminUser.delete({ where: { id: actor.id } });
  }
  await database.$disconnect();
}
