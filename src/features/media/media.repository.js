import { db } from '../../lib/db.js';

export const findMedia = (id, client = db) =>
  client.mediaAsset.findUnique({ where: { id }, include: { usages: true } });
export const findMediaByIds = (ids, client = db) =>
  client.mediaAsset.findMany({ where: { id: { in: ids } } });
export const allMedia = () => db.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
export async function publishedMedia() {
  const pages = await db.page.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { publishedRevisionId: true },
  });
  return db.mediaAsset.findMany({
    where: {
      usages: {
        some: {
          OR: [
            {
              entityType: 'PageRevision',
              entityId: { in: pages.map((page) => page.publishedRevisionId).filter(Boolean) },
            },
            { entityType: 'SiteSetting', entityId: 'site' },
          ],
        },
      },
    },
  });
}
export const insertMedia = (data, client = db) => client.mediaAsset.create({ data });
export const updateMedia = (id, data, client) => client.mediaAsset.update({ where: { id }, data });
export const removeMedia = (id, client) => client.mediaAsset.delete({ where: { id } });
export const findMediaList = (where, skip, take) =>
  db.mediaAsset.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: { usages: true },
  });
export const countMedia = (where) => db.mediaAsset.count({ where });
export const removeUsages = (entityType, entityIds, client) =>
  client.mediaUsage.deleteMany({ where: { entityType, entityId: { in: entityIds } } });
export const insertUsages = (data, client) =>
  client.mediaUsage.createMany({ data, skipDuplicates: true });
