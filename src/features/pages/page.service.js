import { cmsTransaction } from '../../lib/db.js';
import { HttpError, notFound } from '../../lib/errors.js';
import { refreshPublic } from '../../lib/revalidate.js';
import { audit } from '../audit/audit.service.js';
import { setMediaReferences } from '../media/media-references.service.js';
import { publishedMedia, removeUsages } from '../media/media.repository.js';
import { createPageSchema, pageContentSchema, updatePageSchema } from './page.schema.js';
import { mapDraft, mapPublished } from './page.mapper.js';
import {
  findPage,
  findPublishedPage,
  findPublishedPages,
  findPageList,
  countPages,
  insertPage,
  updatePage,
  insertRevision,
  updateRevision,
  findRevisions,
  deleteRevisions,
  findSlugConflict,
  findRedirect,
  upsertRedirect,
  removeRedirect,
  retargetRedirects,
} from './page.repository.js';

export async function getPublicPage(slug = '') {
  return mapPublished(await findPublishedPage(slug));
}
export async function getPublicNavigation() {
  const pages = (await findPublishedPages()).map(mapPublished).filter(Boolean);
  return pages
    .filter((page) => page.showInNav)
    .sort((left, right) => left.navOrder - right.navOrder)
    .map((page) => ({
      id: page.id,
      title: page.title,
      label: page.navLabel || page.title,
      navLabel: page.navLabel || page.title,
      slug: page.slug,
      href: page.slug ? `/${page.slug}` : '/',
    }));
}
export async function getPublicMedia() {
  return Object.fromEntries((await publishedMedia()).map((asset) => [asset.id, asset]));
}
export async function getPublicSitemap() {
  return (await findPublishedPages()).map((page) => ({
    slug: page.publishedSlug,
    updatedAt: page.publishedAt,
  }));
}
export async function getRedirect(path) {
  const redirect = await findRedirect(path);
  if (!redirect || redirect.newPath === path) return null;
  return (await findPublishedPage(redirect.newPath.replace(/^\//, ''))) ? redirect : null;
}
export async function getAdminPage(id) {
  const page = await findPage(id);
  if (!page) notFound('Trang không tồn tại.');
  return { ...mapDraft(page), revisions: await findRevisions(id) };
}

export async function listPages({ q = '', status = '', page = 1, pageSize = 20 } = {}) {
  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(status) ? { status } : {}),
  };
  const [items, total] = await Promise.all([
    findPageList(where, (page - 1) * pageSize, pageSize),
    countPages(where),
  ]);
  return { items: items.map(mapDraft), total, page, pageSize };
}

async function checkSlug(page, content, tx) {
  if (page.type === 'HOME' && content.slug !== '')
    throw new HttpError(422, 'HOME_SLUG', 'Trang chủ luôn sử dụng đường dẫn /.');
  if (page.type !== 'HOME' && content.slug === '')
    throw new HttpError(422, 'EMPTY_SLUG', 'Vui lòng nhập đường dẫn trang.');
  if (await findSlugConflict(page.id, content.slug, tx))
    throw new HttpError(409, 'SLUG_EXISTS', 'Đường dẫn đã được sử dụng bởi trang khác.', {
      slug: 'Đường dẫn đã tồn tại.',
    });
}

async function pruneRevisions(pageId, tx) {
  const revisions = await findRevisions(pageId, tx);
  const page = await findPage(pageId, tx);
  const keep = new Set([
    page.draftRevisionId,
    page.publishedRevisionId,
    ...revisions.slice(0, 20).map((revision) => revision.id),
    ...revisions
      .filter((revision) => revision.isPublished)
      .slice(0, 10)
      .map((revision) => revision.id),
  ]);
  const oldIds = revisions
    .filter((revision) => !keep.has(revision.id))
    .map((revision) => revision.id);
  if (oldIds.length) {
    await removeUsages('PageRevision', oldIds, tx);
    await deleteRevisions(oldIds, tx);
  }
}

export async function createPage(input, actor) {
  const data = createPageSchema.parse(input);
  const { type: _type, ...fields } = data;
  const content = pageContentSchema.parse(fields);
  if (!content.slug) throw new HttpError(422, 'EMPTY_SLUG', 'Vui lòng nhập đường dẫn trang.');
  // `type` is an entity property, never editor-controlled content.
  const result = await cmsTransaction(async (tx) => {
    const page = await insertPage({ title: content.title, slug: content.slug }, tx);
    await checkSlug(page, content, tx);
    const revision = await insertRevision(
      { pageId: page.id, revisionNumber: 1, contentJson: content, createdBy: actor.id },
      tx,
    );
    await setMediaReferences('PageRevision', revision.id, content, tx);
    await updatePage(page.id, { draftRevisionId: revision.id, revisionCounter: 1 }, tx);
    await audit(actor.id, 'PAGE_CREATED', 'Page', page.id, `Tạo trang: ${content.title}`, tx);
    return page.id;
  });
  return getAdminPage(result);
}

export async function savePage(id, input, actor) {
  const data = updatePageSchema.parse(input);
  const { updatedAt, ...changes } = data;
  await cmsTransaction(async (tx) => {
    const page = await findPage(id, tx);
    if (!page) notFound();
    if (updatedAt && page.updatedAt.toISOString() !== updatedAt)
      throw new HttpError(
        409,
        'STALE_REVISION',
        'Trang đã được cập nhật ở một phiên khác. Vui lòng tải lại trước khi lưu.',
      );
    const content = pageContentSchema.parse({ ...page.draftRevision.contentJson, ...changes });
    await checkSlug(page, content, tx);
    const revision = await insertRevision(
      {
        pageId: id,
        revisionNumber: page.revisionCounter + 1,
        contentJson: content,
        createdBy: actor.id,
      },
      tx,
    );
    await setMediaReferences('PageRevision', revision.id, content, tx);
    await updatePage(
      id,
      {
        title: content.title,
        slug: content.slug,
        draftRevisionId: revision.id,
        revisionCounter: page.revisionCounter + 1,
        updatedAt: new Date(Math.max(Date.now(), page.updatedAt.getTime() + 1)),
      },
      tx,
    );
    await pruneRevisions(id, tx);
    await audit(actor.id, 'PAGE_UPDATED', 'Page', id, `Lưu nháp: ${content.title}`, tx);
  });
  return getAdminPage(id);
}

export async function publishPage(id, actor, expectedDraftRevisionId) {
  await cmsTransaction(async (tx) => {
    const page = await findPage(id, tx);
    if (!page?.draftRevision) notFound();
    if (expectedDraftRevisionId && page.draftRevisionId !== expectedDraftRevisionId)
      throw new HttpError(
        409,
        'STALE_PUBLISH_REVISION',
        'Bản nháp đã thay đổi ở một phiên khác. Vui lòng xem lại trước khi xuất bản.',
      );
    const content = pageContentSchema.parse(page.draftRevision.contentJson);
    await checkSlug(page, content, tx);
    if (
      !content.seoTitle ||
      !content.seoDescription ||
      !content.sections.some((section) => section.enabled && section.type === 'hero')
    )
      throw new HttpError(
        422,
        'PUBLISH_VALIDATION',
        'Cần SEO title, mô tả SEO và ít nhất một Hero đang bật để xuất bản.',
      );
    await setMediaReferences('PageRevision', page.draftRevisionId, content, tx);
    const oldPath =
      page.publishedSlug === null ? null : page.publishedSlug ? `/${page.publishedSlug}` : '/';
    const newPath = content.slug ? `/${content.slug}` : '/';
    // A newly published page may reuse a former URL. Its route must take
    // ownership, including after a later unpublish, rather than revive a stale redirect.
    await removeRedirect(newPath, tx);
    if (oldPath && oldPath !== newPath) {
      await retargetRedirects(oldPath, newPath, tx);
      await upsertRedirect(oldPath, newPath, tx);
    }
    await updateRevision(page.draftRevisionId, { isPublished: true }, tx);
    await updatePage(
      id,
      {
        publishedRevisionId: page.draftRevisionId,
        publishedSlug: content.slug,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      tx,
    );
    await audit(actor.id, 'PAGE_PUBLISHED', 'Page', id, `Xuất bản: ${content.title}`, tx);
  });
  refreshPublic();
  return getAdminPage(id);
}

export async function unpublishPage(id, actor) {
  await cmsTransaction(async (tx) => {
    const page = await findPage(id, tx);
    if (!page) notFound();
    await updatePage(id, { status: 'UNPUBLISHED' }, tx);
    await audit(actor.id, 'PAGE_UNPUBLISHED', 'Page', id, `Gỡ xuất bản: ${page.title}`, tx);
  });
  refreshPublic();
  return getAdminPage(id);
}

export async function deletePage(id, actor) {
  await cmsTransaction(async (tx) => {
    const page = await findPage(id, tx);
    if (!page) notFound();
    if (page.type === 'HOME')
      throw new HttpError(409, 'HOME_PROTECTED', 'Không thể xóa trang chủ.');
    await updatePage(id, { deletedAt: new Date(), status: 'UNPUBLISHED' }, tx);
    await audit(actor.id, 'PAGE_DELETED', 'Page', id, `Xóa trang: ${page.title}`, tx);
  });
  refreshPublic();
  return { id, deleted: true };
}
