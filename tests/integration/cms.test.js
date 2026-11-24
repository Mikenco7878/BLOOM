import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/revalidate.js', () => ({ refreshPublic: vi.fn() }));

import { db } from '../../src/lib/db.js';
import {
  createPage,
  deletePage,
  getAdminPage,
  getPublicPage,
  getPublicNavigation,
  getRedirect,
  publishPage,
  savePage,
  unpublishPage,
} from '../../src/features/pages/page.service.js';
import { deleteMedia } from '../../src/features/media/media.service.js';
import { createPageSchema } from '../../src/features/pages/page.schema.js';
import { settingsSchema } from '../../src/features/settings/settings.schema.js';

const suiteId = randomUUID().replaceAll('-', '').slice(0, 12);
const slug = (suffix) => `qa-${suiteId}-${suffix}`;
let actor;
const pageIds = [];
const mediaIds = [];

async function asset() {
  const result = await db.mediaAsset.create({
    data: {
      provider: 'seed',
      providerKey: `qa-${randomUUID()}`,
      url: '/placeholders/botanical.svg',
      width: 10,
      height: 10,
      bytes: 1,
      mimeType: 'image/webp',
      filename: 'qa-isolated.webp',
      altText: 'QA fixture',
    },
  });
  mediaIds.push(result.id);
  return result;
}

function hero(imageId, heading = 'Published heading') {
  return {
    id: 'hero',
    type: 'hero',
    enabled: true,
    sortOrder: 0,
    data: { heading, imageId, primaryCta: { label: 'Contact', href: '/lien-he' } },
  };
}

async function create(suffix, sections = [hero(null)]) {
  const page = await createPage(
    {
      title: 'Isolated integration fixture',
      slug: slug(suffix),
      seoTitle: 'Fixture SEO',
      seoDescription: 'A test page removed when the test suite ends.',
      sections,
    },
    actor,
  );
  pageIds.push(page.id);
  return page;
}

beforeAll(async () => {
  try {
    process.loadEnvFile('.env');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  actor = await db.adminUser.create({
    data: {
      email: `qa-${suiteId}@example.invalid`,
      name: 'Isolated QA actor',
      passwordHash: 'not-an-authentication-fixture',
    },
  });
});

afterAll(async () => {
  const revisions = await db.pageRevision.findMany({
    where: { pageId: { in: pageIds } },
    select: { id: true },
  });
  await db.mediaUsage.deleteMany({
    where: {
      entityType: 'PageRevision',
      entityId: { in: revisions.map((revision) => revision.id) },
    },
  });
  await db.page.updateMany({
    where: { id: { in: pageIds } },
    data: { draftRevisionId: null, publishedRevisionId: null },
  });
  await db.page.deleteMany({ where: { id: { in: pageIds } } });
  await db.mediaAsset.deleteMany({ where: { id: { in: mediaIds } } });
  await db.redirect.deleteMany({ where: { oldPath: { startsWith: `/qa-${suiteId}-` } } });
  if (actor) {
    await db.auditLog.deleteMany({ where: { adminUserId: actor.id } });
    await db.adminUser.delete({ where: { id: actor.id } });
  }
});

describe('Real PostgreSQL CMS transactions', () => {
  it('isolates content, metadata, slug and navigation until atomic publish', async () => {
    const first = await asset();
    const second = await asset();
    const page = await create('snapshot', [hero(first.id)]);
    expect(await getPublicPage(page.slug)).toBeNull();
    await publishPage(page.id, actor);
    const draft = await savePage(
      page.id,
      {
        title: 'Private draft title',
        slug: slug('renamed'),
        seoTitle: 'Private draft SEO',
        navLabel: 'Private draft navigation',
        showInNav: true,
        sections: [hero(second.id, 'Private draft heading')],
      },
      actor,
    );
    const publicBefore = await getPublicPage(page.slug);
    expect(publicBefore.title).toBe(page.title);
    expect(publicBefore.seoTitle).toBe('Fixture SEO');
    expect(publicBefore.sections[0].data.imageId).toBe(first.id);
    expect(await getPublicPage(draft.slug)).toBeNull();
    expect((await getPublicNavigation()).some((item) => item.id === page.id)).toBe(false);
    expect((await getAdminPage(page.id)).sections[0].data.heading).toBe('Private draft heading');
    await publishPage(page.id, actor);
    expect(await getPublicPage(page.slug)).toBeNull();
    expect((await getPublicPage(draft.slug)).seoTitle).toBe('Private draft SEO');
    expect((await getRedirect(`/${page.slug}`)).newPath).toBe(`/${draft.slug}`);
    const reusedPath = await create('snapshot');
    await publishPage(reusedPath.id, actor);
    await unpublishPage(reusedPath.id, actor);
    expect(await getRedirect(`/${page.slug}`)).toBeNull();
    await expect(deleteMedia(first.id, actor)).rejects.toMatchObject({
      status: 409,
      code: 'MEDIA_IN_USE',
    });
    await expect(deleteMedia(second.id, actor)).rejects.toMatchObject({ status: 409 });
    await unpublishPage(page.id, actor);
    expect(await getPublicPage(draft.slug)).toBeNull();
    expect((await getAdminPage(page.id)).sections[0].data.heading).toBe('Private draft heading');
  });

  it('allows one optimistic save and rejects a simultaneous stale edit', async () => {
    const page = await create('concurrency');
    const results = await Promise.allSettled([
      savePage(page.id, { title: 'First concurrent edit', updatedAt: page.updatedAt }, actor),
      savePage(page.id, { title: 'Second concurrent edit', updatedAt: page.updatedAt }, actor),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason).toMatchObject({
      status: 409,
      code: 'STALE_REVISION',
    });
    expect((await getAdminPage(page.id)).revisions).toHaveLength(2);
  });

  it('rejects stale publish preconditions without changing the public snapshot', async () => {
    const page = await create('stale-publish');
    await publishPage(page.id, actor, page.draftRevisionId);
    const reviewed = await savePage(page.id, { sections: [hero(null, 'Reviewed draft')] }, actor);
    const newer = await savePage(page.id, { sections: [hero(null, 'Another tab draft')] }, actor);
    await expect(publishPage(page.id, actor, reviewed.draftRevisionId)).rejects.toMatchObject({
      status: 409,
      code: 'STALE_PUBLISH_REVISION',
    });
    expect((await getPublicPage(page.slug)).sections[0].data.heading).toBe('Published heading');
    expect((await getAdminPage(page.id)).draftRevisionId).toBe(newer.draftRevisionId);
    await publishPage(page.id, actor, newer.draftRevisionId);
    expect((await getPublicPage(page.slug)).sections[0].data.heading).toBe('Another tab draft');
  });

  it('serializes media deletion and draft reference creation without dangling media IDs', async () => {
    const media = await asset();
    const page = await create('media-race');
    const results = await Promise.allSettled([
      savePage(page.id, { sections: [hero(media.id)] }, actor),
      deleteMedia(media.id, actor),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const current = await getAdminPage(page.id);
    const imageId = current.sections[0].data.imageId;
    if (imageId) expect(await db.mediaAsset.findUnique({ where: { id: imageId } })).not.toBeNull();
    else expect(await db.mediaAsset.findUnique({ where: { id: media.id } })).toBeNull();
    const failure = results.find((result) => result.status === 'rejected').reason;
    expect([409, 422]).toContain(failure.status);
  });

  it('rolls back invalid references and failed publish without altering public data', async () => {
    const page = await create('rollback');
    await publishPage(page.id, actor);
    const before = await getAdminPage(page.id);
    await expect(
      savePage(page.id, { sections: [hero('missing-media')] }, actor),
    ).rejects.toMatchObject({ status: 422 });
    const after = await getAdminPage(page.id);
    expect(after.updatedAt).toBe(before.updatedAt);
    expect(after.revisions).toHaveLength(before.revisions.length);
    await savePage(page.id, { sections: [] }, actor);
    await expect(publishPage(page.id, actor)).rejects.toMatchObject({ status: 422 });
    expect((await getPublicPage(page.slug)).sections).toHaveLength(1);
  });

  it('protects HOME creation, empty slugs, duplicate slugs and settings trust boundaries', async () => {
    expect(
      createPageSchema.safeParse({ title: 'Forbidden', slug: 'home', type: 'HOME' }).success,
    ).toBe(false);
    await expect(
      createPage({ title: 'Forbidden empty path', slug: '' }, actor),
    ).rejects.toMatchObject({ status: 422 });
    expect(settingsSchema.safeParse({ siteName: 'Site', id: 'other-settings' }).success).toBe(
      false,
    );
    const page = await create('duplicate');
    await expect(createPage({ title: 'Duplicate', slug: page.slug }, actor)).rejects.toMatchObject({
      code: 'P2002',
    });
    await deletePage(page.id, actor);
    expect(await getPublicPage(page.slug)).toBeNull();
  });
});
