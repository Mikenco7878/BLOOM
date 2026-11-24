import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import sharp from 'sharp';
import { randomBytes, createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';

const database = new PrismaClient();
const origin = 'http://localhost:3000';
const suffix = randomBytes(6).toString('hex');
const credentials = {
  email: `qa-${suffix}@example.com`,
  password: randomBytes(24).toString('hex'),
};
let adminId, apiContext, home, original, uploadedId;
const createdPages = [];
const createdLeads = [];

async function payload(response, expectedStatus = 200) {
  const body = await response.json();
  expect(response.status(), JSON.stringify(body)).toBe(expectedStatus);
  expect(body.success).toBe(true);
  return body.data;
}

test.beforeAll(async ({ playwright }) => {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (!['localhost', '127.0.0.1'].includes(databaseUrl.hostname))
    throw new Error('E2E requires a disposable local PostgreSQL database.');
  await database.rateLimitBucket.deleteMany({
    where: { OR: [{ key: { startsWith: 'contact:' } }, { key: { startsWith: 'login-address:' } }] },
  });
  const admin = await database.adminUser.create({
    data: {
      email: credentials.email,
      passwordHash: await argon2.hash(credentials.password),
      name: 'BLOOM QA',
    },
  });
  adminId = admin.id;
  apiContext = await playwright.request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
  });
  await payload(await apiContext.post('/api/v1/auth/login', { data: credentials }));
  const pages = await payload(await apiContext.get('/api/v1/admin/pages?pageSize=100'));
  home = pages.items.find((page) => page.type === 'HOME');
  expect(home).toBeTruthy();
  original = await payload(await apiContext.get(`/api/v1/admin/pages/${home.id}`));
});

test.afterAll(async () => {
  // Restore content via the real API. All other cleanup is restricted to QA-owned IDs.
  if (apiContext && original) {
    const {
      title,
      slug,
      navLabel,
      showInNav,
      navOrder,
      seoTitle,
      seoDescription,
      ogImageId,
      sections,
    } = original;
    await apiContext.patch(`/api/v1/admin/pages/${home.id}`, {
      data: {
        title,
        slug,
        navLabel,
        showInNav,
        navOrder,
        seoTitle,
        seoDescription,
        ogImageId,
        sections,
      },
    });
    await apiContext.post(`/api/v1/admin/pages/${home.id}/publish`);
  }
  for (const id of createdPages) await apiContext?.delete(`/api/v1/admin/pages/${id}`);
  await database.contactLead.deleteMany({
    where: { OR: [{ id: { in: createdLeads } }, { email: credentials.email }] },
  });
  if (adminId) await database.adminUser.delete({ where: { id: adminId } });
  await apiContext?.dispose();
  await database.$disconnect();
});

test('admin upload → homepage draft unchanged → private preview → publish → visitor contact → inbox', async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const visitor = await browser.newContext({ baseURL: origin });
  const publicPage = await visitor.newPage();
  await publicPage.goto('/');
  const publishedHeading = await publicPage.locator('h1').innerText();

  await page.goto('/admin/login');
  await page.getByLabel('Email', { exact: true }).fill(credentials.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/pages/${home.id}/edit`);
  await page.getByLabel('Tiêu đề', { exact: true }).fill(`BLOOM QA ${suffix}`);
  await page.getByRole('button', { name: /^(Thay ảnh|Chọn ảnh)$/ }).click();
  const picker = page.getByRole('dialog');
  const image = await sharp({
    create: { width: 480, height: 320, channels: 3, background: '#668b56' },
  })
    .png()
    .toBuffer();
  await picker
    .getByLabel('Tải ảnh mới')
    .setInputFiles({ name: `qa-${suffix}.png`, mimeType: 'image/png', buffer: image });
  await picker.getByLabel('Văn bản thay thế').fill(`Ảnh kiểm thử ${suffix}`);
  const uploadResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/admin/media') && response.request().method() === 'POST',
  );
  await picker.getByRole('button', { name: 'Tải lên', exact: true }).click();
  const uploaded = await payload(await uploadResponse, 201);
  uploadedId = uploaded.id;
  await picker.getByRole('button', { name: new RegExp(`qa-${suffix}\\.png`) }).click();
  await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu bản nháp');
  await publicPage.reload();
  await expect(publicPage.locator('h1')).toHaveText(publishedHeading);
  await expect(publicPage.locator('h1')).not.toContainText(suffix);

  const previewEvent = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
  const preview = await previewEvent;
  await expect(preview.locator('h1')).toHaveText(`BLOOM QA ${suffix}`);
  await expect(preview.locator(`img[alt="Ảnh kiểm thử ${suffix}"]`)).toBeVisible();
  await publicPage.goto(`/admin/preview/${home.id}`);
  await expect(publicPage).toHaveURL(/\/admin\/login/);
  await preview.close();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Xuất bản', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã xuất bản');
  await publicPage.goto('/');
  await expect(publicPage.locator('h1')).toHaveText(`BLOOM QA ${suffix}`);
  await expect(publicPage.locator(`img[alt="Ảnh kiểm thử ${suffix}"]`)).toBeVisible();
  const servedImage = await publicPage.request.get(uploaded.url);
  expect(servedImage.ok()).toBe(true);
  expect(servedImage.headers()['content-type']).toContain('image/webp');
  expect((await publicPage.request.get(uploaded.thumbnailUrl)).ok()).toBe(true);
  expect((await apiContext.delete(`/api/v1/admin/media/${uploadedId}`)).status()).toBe(409);

  await publicPage.goto('/lien-he');
  await publicPage.locator('[name="name"]').fill('BLOOM QA');
  await publicPage.locator('[name="email"]').fill(credentials.email);
  await publicPage.locator('[name="subject"]').selectOption('PARTNERSHIP');
  await publicPage
    .locator('[name="message"]')
    .fill(`Tôi muốn tìm hiểu hợp tác cùng BLOOM ${suffix}.`);
  await publicPage.locator('[name="consent"]').check();
  const contactResponse = publicPage.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/contacts') && response.request().method() === 'POST',
  );
  await publicPage.getByRole('button', { name: /Gửi/ }).click();
  const lead = await payload(await contactResponse, 201);
  createdLeads.push(lead.id);
  await page.goto('/admin/contacts');
  await expect(page.getByText(credentials.email, { exact: true })).toBeVisible();
  const savedLead = await database.contactLead.findUnique({ where: { id: lead.id } });
  expect(savedLead.status).toBe('NEW');
  expect(savedLead.consentAt).toBeTruthy();
  await mkdir('.data/screenshots', { recursive: true });
  await publicPage.goto('/');
  await publicPage.screenshot({ path: '.data/screenshots/published-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
  await visitor.close();
});

test('anonymous APIs, origin checks, duplicate/reserved slugs and draft URLs are protected', async ({
  request,
}) => {
  for (const path of ['dashboard', 'pages', 'media', 'contacts', 'settings', 'audit']) {
    expect((await request.get(`/api/v1/admin/${path}`)).status()).toBe(401);
  }
  expect(
    (
      await apiContext.patch('/api/v1/admin/settings', {
        headers: { Origin: 'https://evil.example' },
        data: { siteName: 'bad' },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await apiContext.post('/api/v1/admin/pages', { data: { title: 'Reserved', slug: 'admin' } })
    ).status(),
  ).toBe(422);
  const slug = `qa-${suffix}`;
  const content = {
    title: 'QA draft title',
    slug,
    seoTitle: 'QA published SEO',
    seoDescription: 'QA page description for publication.',
    showInNav: true,
    navLabel: 'QA nav',
    sections: [
      {
        id: 'qa-hero',
        type: 'hero',
        enabled: true,
        sortOrder: 0,
        data: {
          heading: `Private QA ${suffix}`,
          primaryCta: { label: 'Liên hệ', href: '/lien-he' },
        },
      },
      {
        id: 'qa-text',
        type: 'rich_text',
        enabled: true,
        sortOrder: 1,
        data: { heading: 'QA detail', paragraphs: ['A structured paragraph.'] },
      },
    ],
  };
  const created = await payload(
    await apiContext.post('/api/v1/admin/pages', { data: content }),
    201,
  );
  createdPages.push(created.id);
  expect((await request.get(`/${slug}`)).status()).toBe(404);
  expect(
    (await apiContext.post('/api/v1/admin/pages', { data: { title: 'Duplicate', slug } })).status(),
  ).toBe(409);
  await payload(await apiContext.post(`/api/v1/admin/pages/${created.id}/publish`));
  expect(await (await request.get(`/${slug}`)).text()).toContain('QA published SEO');
  const saved = await payload(
    await apiContext.patch(`/api/v1/admin/pages/${created.id}`, {
      data: {
        title: 'Private metadata',
        slug: `${slug}-new`,
        seoTitle: 'Private SEO',
        navLabel: 'Private nav',
        sections: [...content.sections]
          .reverse()
          .map((section, sortOrder) => ({ ...section, sortOrder })),
      },
    }),
  );
  const oldHtml = await (await request.get(`/${slug}`)).text();
  expect(oldHtml).toContain('QA published SEO');
  expect(oldHtml).not.toContain('Private SEO');
  expect((await request.get(`/${slug}-new`)).status()).toBe(404);
  expect(
    (
      await apiContext.patch(`/api/v1/admin/pages/${created.id}`, {
        data: { title: 'stale', updatedAt: created.updatedAt },
      })
    ).status(),
  ).toBe(409);
  expect(saved.sections.map((section) => section.id)).toEqual(['qa-text', 'qa-hero']);
  await payload(await apiContext.post(`/api/v1/admin/pages/${created.id}/publish`));
  const redirected = await request.get(`/${slug}`, { maxRedirects: 0 });
  expect([301, 308]).toContain(redirected.status());
  expect(redirected.headers().location).toContain(`${slug}-new`);
  await payload(await apiContext.post(`/api/v1/admin/pages/${created.id}/unpublish`));
  expect((await request.get(`/${slug}-new`)).status()).toBe(404);
  expect((await apiContext.delete(`/api/v1/admin/pages/${home.id}`)).status()).toBe(409);
});

test('invalid upload bytes and oversized files are rejected without orphan metadata', async () => {
  const before = await database.mediaAsset.count();
  for (const file of [
    {
      name: 'fake.png',
      mimeType: 'image/png',
      buffer: Buffer.from('<svg><script>bad</script></svg>'),
    },
    { name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
  ]) {
    const response = await apiContext.post('/api/v1/admin/media', {
      multipart: { file, altText: 'Invalid QA' },
    });
    expect([413, 422]).toContain(response.status());
  }
  expect(await database.mediaAsset.count()).toBe(before);
});

test('inbox status, audit, settings and dashboard metrics persist to PostgreSQL', async ({
  request,
}) => {
  const lead = await database.contactLead.create({
    data: {
      name: 'QA inbox',
      email: credentials.email,
      subject: 'OTHER',
      message: 'A test enquiry for workflow management.',
      consentAt: new Date(),
    },
  });
  const leadId = lead.id;
  createdLeads.push(leadId);
  await payload(
    await apiContext.patch(`/api/v1/admin/contacts/${leadId}`, {
      data: { status: 'RESOLVED', internalNote: `private-${suffix}` },
    }),
  );
  expect((await database.contactLead.findUnique({ where: { id: leadId } })).status).toBe(
    'RESOLVED',
  );
  const dashboard = await payload(await apiContext.get('/api/v1/admin/dashboard'));
  expect(dashboard.metrics.publishedPages).toBe(
    await database.page.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
  );
  expect(dashboard.metrics.newContacts).toBe(
    await database.contactLead.count({ where: { status: 'NEW' } }),
  );
  expect(dashboard.metrics.mediaCount).toBe(await database.mediaAsset.count());
  expect(
    await database.auditLog.count({
      where: { action: 'CONTACT_STATUS_UPDATED', entityId: leadId },
    }),
  ).toBeGreaterThan(0);
  const settings = await payload(await apiContext.get('/api/v1/admin/settings'));
  try {
    await payload(
      await apiContext.patch('/api/v1/admin/settings', {
        data: { footerText: `QA footer ${suffix}` },
      }),
    );
    const html = await (await request.get('/')).text();
    expect(html).toContain(`QA footer ${suffix}`);
    expect(html).not.toContain(`private-${suffix}`);
  } finally {
    await apiContext.patch('/api/v1/admin/settings', { data: { footerText: settings.footerText } });
  }
});

test('public routes, SEO, mobile menu and reduced motion render without overflow', async ({
  page,
}) => {
  const paths = [
    '/',
    '/ve-bloom',
    '/san-pham',
    '/quy-trinh',
    '/phat-trien-ben-vung',
    '/hanh-trinh',
    '/du-an',
    '/lien-he',
  ];
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).href).toBe(
      new URL(path, origin).href,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (width === 360)
      await page.screenshot({ path: '.data/screenshots/mobile.png', fullPage: true });
  }
  const sitemap = await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/san-pham');
  expect(sitemap).not.toContain('/admin');
  expect(sitemap).not.toContain(`qa-${suffix}`);
});

test('logout invalidates the session; expired sessions are rejected server-side', async ({
  playwright,
}) => {
  const isolated = await playwright.request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
  });
  await payload(await isolated.post('/api/v1/auth/login', { data: credentials }));
  const state = await isolated.storageState();
  const token = state.cookies.find((cookie) => cookie.name === 'bloom_admin').value;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await payload(await isolated.post('/api/v1/auth/logout'));
  expect((await isolated.get('/api/v1/admin/pages')).status()).toBe(401);
  expect((await database.adminSession.findUnique({ where: { tokenHash } })).revokedAt).toBeTruthy();
  await payload(await isolated.post('/api/v1/auth/login', { data: credentials }));
  const renewed = (await isolated.storageState()).cookies.find(
    (cookie) => cookie.name === 'bloom_admin',
  ).value;
  await database.adminSession.update({
    where: { tokenHash: createHash('sha256').update(renewed).digest('hex') },
    data: { expiresAt: new Date(0) },
  });
  expect((await isolated.get('/api/v1/admin/dashboard')).status()).toBe(401);
  await isolated.dispose();
});

test('SSR content and native contact POST work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: origin,
    javaScriptEnabled: false,
    viewport: { width: 360, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('/lien-he');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('[name="name"]').fill('QA no JavaScript');
  await page.locator('[name="email"]').fill(credentials.email);
  await page.locator('[name="subject"]').selectOption('OTHER');
  await page.locator('[name="message"]').fill(`Native POST contact ${suffix}.`);
  await page.locator('[name="consent"]').check();
  await page.getByRole('button', { name: 'Gửi liên hệ' }).click();
  await expect(page).toHaveURL(/sent=1/);
  expect(
    await database.contactLead.count({
      where: { email: credentials.email, name: 'QA no JavaScript' },
    }),
  ).toBe(1);
  await context.close();
});

test('keyboard menu/gallery and every admin workspace screen remain usable on mobile', async ({
  page,
  context,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/san-pham');
  const menu = page.getByRole('button', { name: 'Mở menu', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  const opener = page.getByRole('button', { name: /^Phóng lớn:/ }).first();
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
  await context.addCookies((await apiContext.storageState()).cookies);
  for (const [path, resource] of [
    ['/admin', 'dashboard'],
    ['/admin/pages', 'pages'],
    ['/admin/media', 'media'],
    ['/admin/contacts', 'contacts'],
    ['/admin/settings', 'settings'],
    ['/admin/activity', 'audit'],
  ]) {
    const loaded = page.waitForResponse(
      (response) => new URL(response.url()).pathname === `/api/v1/admin/${resource}`,
    );
    expect((await page.goto(path)).status()).toBe(200);
    expect((await loaded).status(), path).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main').getByRole('alert')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const adminMenu = page.getByRole('button', { name: 'Mở menu quản trị' });
  await adminMenu.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(adminMenu).toHaveAttribute('aria-expanded', 'false');
  await page.goto('/admin/preview/missing-qa-page');
  await expect(page.getByText('Trang này chưa nảy mầm.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('invalid contacts, spam and login brute force are limited', async ({ request }) => {
  const contact = {
    name: 'QA contact',
    email: credentials.email,
    subject: 'OTHER',
    message: 'An enquiry with enough characters.',
    consent: true,
  };
  expect(
    (
      await request.post('/api/v1/contacts', {
        headers: { Origin: origin },
        data: { ...contact, email: 'bad' },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post('/api/v1/contacts', {
        headers: { Origin: origin },
        data: { ...contact, consent: false },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post('/api/v1/contacts', {
        headers: { Origin: origin },
        data: { ...contact, website: 'https://spam.example' },
      })
    ).status(),
  ).toBe(422);
  let limited = false;
  for (let index = 0; index < 5; index++) {
    const response = await request.post('/api/v1/contacts', {
      headers: { Origin: origin },
      data: { ...contact, consent: false },
    });
    if (response.status() === 429) {
      limited = true;
      break;
    }
  }
  expect(limited).toBe(true);
  const nonexistent = `missing-${suffix}@example.com`;
  for (let index = 0; index < 5; index++) {
    expect(
      (
        await request.post('/api/v1/auth/login', {
          headers: { Origin: origin },
          data: { email: nonexistent, password: credentials.password },
        })
      ).status(),
    ).toBe(401);
  }
  expect(
    (
      await request.post('/api/v1/auth/login', {
        headers: { Origin: origin },
        data: { email: nonexistent, password: credentials.password },
      })
    ).status(),
  ).toBe(429);
});
