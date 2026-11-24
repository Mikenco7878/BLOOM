import { db } from '../../lib/db.js';

export const findPage = (id, client = db) =>
  client.page.findFirst({
    where: { id, deletedAt: null },
    include: { draftRevision: true, publishedRevision: true },
  });
export const findPublishedPage = (slug, client = db) =>
  client.page.findFirst({
    where: { publishedSlug: slug, status: 'PUBLISHED', deletedAt: null },
    include: { publishedRevision: true },
  });
export const findPublishedPages = (client = db) =>
  client.page.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    include: { publishedRevision: true },
    orderBy: { publishedAt: 'desc' },
  });
export const findPageList = (where, skip, take) =>
  db.page.findMany({
    where,
    skip,
    take,
    include: { draftRevision: true },
    orderBy: { updatedAt: 'desc' },
  });
export const countPages = (where) => db.page.count({ where });
export const insertPage = (data, client) => client.page.create({ data });
export const updatePage = (id, data, client) => client.page.update({ where: { id }, data });
export const insertRevision = (data, client) => client.pageRevision.create({ data });
export const updateRevision = (id, data, client) =>
  client.pageRevision.update({ where: { id }, data });
export const findRevisions = (pageId, client = db) =>
  client.pageRevision.findMany({
    where: { pageId },
    orderBy: { revisionNumber: 'desc' },
    select: { id: true, revisionNumber: true, createdAt: true, isPublished: true },
  });
export const deleteRevisions = (ids, client) =>
  client.pageRevision.deleteMany({ where: { id: { in: ids } } });
export const findSlugConflict = (id, slug, client) =>
  client.page.findFirst({ where: { id: { not: id }, OR: [{ slug }, { publishedSlug: slug }] } });
export const findRedirect = (oldPath) => db.redirect.findUnique({ where: { oldPath } });
export const upsertRedirect = (oldPath, newPath, client) =>
  client.redirect.upsert({ where: { oldPath }, update: { newPath }, create: { oldPath, newPath } });
export const removeRedirect = (oldPath, client) =>
  client.redirect.deleteMany({ where: { oldPath } });
export const retargetRedirects = (oldPath, newPath, client) =>
  client.redirect.updateMany({ where: { newPath: oldPath }, data: { newPath } });
