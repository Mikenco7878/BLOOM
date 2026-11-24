import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import sharp from 'sharp';

const databaseUrl = new URL(process.env.DATABASE_URL);
if (
  process.env.BLOOM_SECURITY_TEST !== '1' ||
  databaseUrl.hostname !== '127.0.0.1' ||
  databaseUrl.pathname !== '/bloom_security_test'
)
  throw new Error('Security tests require the isolated runner, never the project database.');

const database = new PrismaClient();
const origin = process.env.SITE_URL;
const suffix = randomBytes(8).toString('hex');
const credentials = {
  email: `security-${suffix}@example.invalid`,
  password: randomBytes(24).toString('hex'),
};
const marker = `private-${suffix}`;
let admin, api, cookie, draft, lead;
const privateRoutes = ['dashboard', 'pages', 'media', 'contacts', 'settings', 'audit'];
const mutations = () => [
  ['POST', '/api/v1/admin/pages'],
  ['PATCH', `/api/v1/admin/pages/${draft.id}`],
  ['DELETE', `/api/v1/admin/pages/${draft.id}`],
  ['POST', `/api/v1/admin/pages/${draft.id}/publish`],
  ['POST', `/api/v1/admin/pages/${draft.id}/unpublish`],
  ['POST', '/api/v1/admin/media'],
  ['PATCH', '/api/v1/admin/media/missing'],
  ['DELETE', '/api/v1/admin/media/missing'],
  ['PATCH', `/api/v1/admin/contacts/${lead.id}`],
  ['DELETE', `/api/v1/admin/contacts/${lead.id}`],
  ['PATCH', '/api/v1/admin/settings'],
  ['POST', '/api/v1/auth/logout'],
];
const contact = () => ({
  name: 'Security test',
  email: credentials.email,
  subject: 'OTHER',
  message: 'An isolated security test enquiry.',
  consent: true,
});
async function login(request, extraHeaders = {}) {
  return request.post('/api/v1/auth/login', {
    headers: { Origin: origin, ...extraHeaders },
    data: credentials,
  });
}
async function authenticated(request) {
  const response = await login(request);
  expect(response.status()).toBe(200);
  return response.headers()['set-cookie'].split(';')[0];
}

test.beforeAll(async ({ playwright }) => {
  admin = await database.adminUser.create({
    data: {
      email: credentials.email,
      name: 'Isolated security administrator',
      passwordHash: await argon2.hash(credentials.password, { type: argon2.argon2id }),
    },
  });
  const client = await playwright.request.newContext({ baseURL: origin });
  cookie = await authenticated(client);
  await client.dispose();
  api = await playwright.request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Cookie: cookie, Origin: origin },
  });
  const response = await api.post('/api/v1/admin/pages', {
    data: {
      title: marker,
      slug: `security-${suffix}`,
      seoTitle: marker,
      seoDescription: marker,
      sections: [
        { id: 'hero', type: 'hero', enabled: true, sortOrder: 0, data: { heading: marker } },
      ],
    },
  });
  expect(response.status()).toBe(201);
  draft = (await response.json()).data;
  lead = await database.contactLead.create({
    data: {
      name: 'Private enquiry',
      email: credentials.email,
      subject: 'OTHER',
      message: marker,
      internalNote: marker,
      consentAt: new Date(),
    },
  });
});
test.beforeEach(async () => {
  // The runner creates this entire cluster exclusively for these tests.
  await database.rateLimitBucket.deleteMany();
});
test.afterAll(async () => {
  await api?.dispose();
  await database.$disconnect();
});

test('all private GET/HEAD and mutation endpoints reject anonymous visitors', async ({
  request,
}) => {
  for (const path of [
    ...privateRoutes.map((route) => `/api/v1/admin/${route}`),
    `/api/v1/admin/pages/${draft.id}`,
    `/api/v1/admin/contacts/${lead.id}`,
  ]) {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(path, { method });
      expect(response.status(), `${method} ${path}`).toBe(401);
      expect(await response.text()).not.toContain(marker);
    }
  }
  for (const [method, path] of mutations()) {
    const response = await request.fetch(path, {
      method,
      headers: { Origin: origin },
      data: {},
    });
    expect(response.status(), `${method} ${path}`).toBe(401);
  }
});

test('forged session cookies, bearer tokens and framework bypass headers do not grant admin access', async ({
  request,
}) => {
  for (const headers of [
    { Cookie: 'bloom_admin=invalid' },
    { Cookie: `bloom_admin=${'a'.repeat(64)}` },
    { Authorization: `Bearer ${cookie.split('=')[1]}` },
    { 'x-middleware-subrequest': 'middleware:middleware:middleware:middleware:middleware' },
    { 'x-invoke-path': '/admin', 'x-nextjs-data': '1' },
  ]) {
    expect((await request.get('/api/v1/admin/dashboard', { headers })).status()).toBe(401);
  }
  expect(
    (await request.get(`/api/v1/admin/dashboard?bloom_admin=${cookie.split('=')[1]}`)).status(),
  ).toBe(401);
});

test('CSRF rejects missing, null, foreign and deceptive origins for every admin mutation', async ({
  request,
}) => {
  for (const [method, path] of mutations()) {
    for (const headers of [
      {},
      { Origin: 'null' },
      { Origin: 'https://attacker.invalid' },
      { Origin: `${origin}.attacker.invalid` },
      { Origin: origin, 'Sec-Fetch-Site': 'cross-site' },
    ]) {
      const response = await request.fetch(path, {
        method,
        headers: { Cookie: cookie, ...headers },
        data: {},
      });
      expect(response.status(), `${method} ${path}`).toBe(403);
    }
  }
  for (const path of ['/api/v1/auth/login', '/api/v1/contacts']) {
    expect(
      (
        await request.post(path, { headers: { Origin: 'https://attacker.invalid' }, data: {} })
      ).status(),
    ).toBe(403);
  }
  expect((await database.page.findUnique({ where: { id: draft.id } })).deletedAt).toBeNull();
});

test('draft content and private contact details never appear on anonymous surfaces', async ({
  request,
}) => {
  const hidden = await request.get(`/${draft.slug}`);
  expect(hidden.status()).toBe(404);
  expect(await hidden.text()).not.toContain(marker);
  for (const path of ['/', '/lien-he', '/sitemap.xml', '/robots.txt'])
    expect(await (await request.get(path)).text()).not.toContain(marker);
  for (const path of ['/admin', '/admin/contacts', `/admin/preview/${draft.id}`]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/admin/login');
    expect(await response.text()).not.toContain(marker);
  }
});

test('production login rotates supplied tokens, hashes sessions and sets protected cookie flags', async ({
  request,
}) => {
  const supplied = 'b'.repeat(64);
  const response = await login(request, { Cookie: `bloom_admin=${supplied}` });
  expect(response.status()).toBe(200);
  const header = response.headers()['set-cookie'];
  for (const flag of ['httponly', 'secure', 'samesite=lax', 'path=/'])
    expect(header.toLowerCase()).toContain(flag);
  const token = header.split(';')[0].split('=')[1];
  expect(token).toMatch(/^[a-f0-9]{64}$/);
  expect(token).not.toBe(supplied);
  const session = await database.adminSession.findUnique({
    where: { tokenHash: createHash('sha256').update(token).digest('hex') },
  });
  expect(session.adminUserId).toBe(admin.id);
  expect(session.tokenHash).not.toBe(token);
  const body = await response.text();
  for (const secret of ['passwordHash', 'tokenHash', credentials.password, token])
    expect(body).not.toContain(secret);
});

test('revoked, expired, inactive and non-admin sessions are denied server-side', async ({
  request,
}) => {
  for (const state of ['revoked', 'expired', 'inactive', 'wrong-role']) {
    const current = await authenticated(request);
    const tokenHash = createHash('sha256').update(current.split('=')[1]).digest('hex');
    try {
      if (state === 'revoked' || state === 'expired')
        await database.adminSession.update({
          where: { tokenHash },
          data: state === 'revoked' ? { revokedAt: new Date() } : { expiresAt: new Date(0) },
        });
      else
        await database.adminUser.update({
          where: { id: admin.id },
          data: state === 'inactive' ? { isActive: false } : { role: 'EDITOR' },
        });
      expect(
        (await request.get('/api/v1/admin/dashboard', { headers: { Cookie: current } })).status(),
      ).toBe(401);
    } finally {
      await database.adminUser.update({
        where: { id: admin.id },
        data: { isActive: true, role: 'ADMIN' },
      });
    }
  }
});

test('logout invalidates a replayed copy of the session cookie', async ({ request }) => {
  const current = await authenticated(request);
  expect(
    (
      await request.post('/api/v1/auth/logout', {
        headers: { Cookie: current, Origin: origin },
      })
    ).status(),
  ).toBe(200);
  expect(
    (await request.get('/api/v1/admin/dashboard', { headers: { Cookie: current } })).status(),
  ).toBe(401);
});

test('invalid JSON, unexpected fields, script URLs and prototype keys are rejected', async () => {
  expect(
    (
      await api.post('/api/v1/admin/pages', {
        headers: { 'Content-Type': 'application/json' },
        data: Buffer.from('{broken'),
      })
    ).status(),
  ).toBe(400);
  for (const data of [
    { title: 'Unsafe', slug: `unsafe-${suffix}`, status: 'PUBLISHED' },
    { title: 'Unsafe', slug: '../admin' },
    JSON.parse('{"title":"Unsafe","slug":"unsafe","__proto__":{"polluted":true}}'),
    {
      title: 'Unsafe',
      slug: `unsafe-${suffix}`,
      sections: [
        {
          id: 'hero',
          type: 'hero',
          enabled: true,
          sortOrder: 0,
          data: { heading: 'Unsafe', primaryCta: { label: 'Go', href: 'javascript:alert(1)' } },
        },
      ],
    },
  ])
    expect((await api.post('/api/v1/admin/pages', { data })).status()).toBe(422);
  expect(
    (
      await api.patch('/api/v1/admin/settings', { data: { id: 'other', siteName: 'Unsafe' } })
    ).status(),
  ).toBe(422);
  expect(
    (
      await api.patch('/api/v1/admin/settings', { data: { facebookUrl: 'javascript:alert(1)' } })
    ).status(),
  ).toBe(422);
});

test('request size limits reject oversized JSON before persistence', async ({ request }) => {
  const before = await database.contactLead.count();
  expect(
    (await api.post('/api/v1/admin/pages', { data: { title: 'x'.repeat(525000) } })).status(),
  ).toBe(413);
  expect(
    (
      await request.post('/api/v1/auth/login', {
        headers: { Origin: origin },
        data: { email: credentials.email, password: 'x'.repeat(5000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await request.post('/api/v1/contacts', {
        headers: { Origin: origin },
        data: { ...contact(), message: 'x'.repeat(17000) },
      })
    ).status(),
  ).toBe(413);
  expect(await database.contactLead.count()).toBe(before);
});

test('SVG, forged image MIME, excessive dimensions and oversized uploads leave no metadata', async () => {
  const before = await database.mediaAsset.count();
  const png = await sharp({ create: { width: 12, height: 12, channels: 3, background: '#1f4d3a' } })
    .png()
    .toBuffer();
  const wide = await sharp({
    create: { width: 9000, height: 1, channels: 3, background: '#1f4d3a' },
  })
    .png()
    .toBuffer();
  const jpeg = await sharp({
    create: { width: 400, height: 400, channels: 3, background: '#1f4d3a' },
  })
    .jpeg()
    .toBuffer();
  for (const file of [
    {
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
    },
    { name: 'photo.webp', mimeType: 'image/webp', buffer: png },
    { name: 'wide.png', mimeType: 'image/png', buffer: wide },
    { name: 'truncated.jpg', mimeType: 'image/jpeg', buffer: jpeg.subarray(0, jpeg.length - 10) },
    { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
  ]) {
    const response = await api.post('/api/v1/admin/media', {
      multipart: { file, altText: 'Security test' },
    });
    expect([413, 422]).toContain(response.status());
  }
  expect(await database.mediaAsset.count()).toBe(before);
});

test('SQL-looking search strings remain literal and cannot alter persistence', async () => {
  const before = await database.adminUser.count();
  for (const resource of ['pages', 'contacts', 'media']) {
    const response = await api.get(`/api/v1/admin/${resource}`, {
      params: { q: "' OR 1=1; SELECT pg_sleep(5); --" },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).data.items).toEqual([]);
  }
  expect(await database.adminUser.count()).toBe(before);
});

test('stored contact payloads render as text in admin without executing', async ({
  request,
  browser,
}) => {
  const payload = '<img src=x onerror="window.__bloomSecurityXss=1">';
  const response = await request.post('/api/v1/contacts', {
    headers: { Origin: origin },
    data: { ...contact(), name: `XSS ${suffix}`, message: payload },
  });
  expect(response.status()).toBe(201);
  const context = await browser.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Cookie: cookie },
  });
  try {
    const page = await context.newPage();
    await page.goto('/admin/contacts');
    await page.getByRole('button', { name: `XSS ${suffix}`, exact: true }).click();
    await expect(page.getByText(payload, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.__bloomSecurityXss)).toBeUndefined();
    expect(await page.locator('img[onerror]').count()).toBe(0);
  } finally {
    await context.close();
  }
});

test('login brute force and spoofed IP headers remain limited with proxy trust disabled', async ({
  request,
}) => {
  for (let index = 0; index < 6; index++) {
    const response = await request.post('/api/v1/auth/login', {
      headers: { Origin: origin, 'X-Forwarded-For': `203.0.113.${index + 1}` },
      data: { email: `absent-${suffix}@example.invalid`, password: credentials.password },
    });
    expect(response.status()).toBe(index < 5 ? 401 : 429);
  }
});

test('CMS text containing markup remains text after publish', async ({ browser }) => {
  const payload = '<img src=x onerror="window.__bloomSecurityXss=1">';
  const response = await api.post('/api/v1/admin/pages', {
    data: {
      title: 'Security escaping test',
      slug: `escaping-${suffix}`,
      seoTitle: 'Security escaping test',
      seoDescription: 'Isolated publication for XSS testing.',
      sections: [
        { id: 'hero', type: 'hero', enabled: true, sortOrder: 0, data: { heading: payload } },
      ],
    },
  });
  expect(response.status()).toBe(201);
  const pageData = (await response.json()).data;
  expect((await api.post(`/api/v1/admin/pages/${pageData.id}/publish`)).status()).toBe(200);
  const context = await browser.newContext({ baseURL: origin });
  try {
    const page = await context.newPage();
    await page.goto(`/${pageData.slug}`);
    await expect(page.locator('h1')).toHaveText(payload);
    expect(await page.locator('img[onerror]').count()).toBe(0);
    expect(await page.evaluate(() => window.__bloomSecurityXss)).toBeUndefined();
  } finally {
    await context.close();
  }
});

test('consent bypass, honeypot spam and private contact field injection are rejected', async ({
  request,
}) => {
  const before = await database.contactLead.count();
  for (const data of [
    { ...contact(), consent: false },
    { ...contact(), website: 'https://spam.invalid' },
    { ...contact(), status: 'RESOLVED', internalNote: 'Injected note' },
  ]) {
    const response = await request.post('/api/v1/contacts', {
      headers: { Origin: origin },
      data,
    });
    expect(response.status()).toBe(422);
  }
  expect(await database.contactLead.count()).toBe(before);
});

test('concurrent contact spam cannot overrun the atomic rate limit', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      request.post('/api/v1/contacts', {
        headers: { Origin: origin, 'X-Forwarded-For': `203.0.113.${index + 1}` },
        data: { ...contact(), message: `Concurrent enquiry ${suffix}` },
      }),
    ),
  );
  expect(responses.filter((response) => response.status() === 201)).toHaveLength(5);
  expect(responses.filter((response) => response.status() === 429)).toHaveLength(5);
  expect(
    await database.contactLead.count({ where: { message: `Concurrent enquiry ${suffix}` } }),
  ).toBe(5);
});

test('sensitive files, traversal paths and arbitrary image proxy targets are inaccessible', async ({
  request,
}) => {
  for (const path of [
    '/.env',
    '/.env.production.local',
    '/.git/config',
    '/.data/local-db.json',
    '/prisma/schema.prisma',
    '/api/v1/uploads/%2e%2e%5c%2e%2e%5c.env',
  ]) {
    const response = await request.get(path);
    expect([400, 404]).toContain(response.status());
    for (const secret of ['DATABASE_URL=', 'SESSION_SECRET=', 'CLOUDINARY_API_SECRET='])
      expect(await response.text()).not.toContain(secret);
  }
  const response = await request.get('/_next/image', {
    params: { url: 'http://127.0.0.1:5432/', w: '640', q: '75' },
  });
  expect(response.status()).toBe(400);
});

test('production security headers and private API cache controls are present', async ({
  request,
}) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('SAMEORIGIN');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['x-powered-by']).toBeUndefined();
  for (const path of privateRoutes) {
    const privateResponse = await api.get(`/api/v1/admin/${path}`);
    expect(privateResponse.status()).toBe(200);
    expect(privateResponse.headers()['cache-control']).toContain('no-store');
    expect(privateResponse.headers()['access-control-allow-origin']).toBeUndefined();
  }
  test.info().annotations.push({
    type: 'hardening',
    description: `CSP=${Boolean(headers['content-security-policy'])}; HSTS=${Boolean(headers['strict-transport-security'])}. Check TLS and host headers on staging.`,
  });
});
