import { db } from '../../lib/db.js';

export async function dashboardSnapshot() {
  const [
    publishedPages,
    draftPages,
    mediaCount,
    newContacts,
    totalContacts,
    recentContacts,
    recentActivity,
    homePage,
  ] = await db.$transaction([
    db.page.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    db.page.count({ where: { status: { in: ['DRAFT', 'UNPUBLISHED'] }, deletedAt: null } }),
    db.mediaAsset.count(),
    db.contactLead.count({ where: { status: 'NEW' } }),
    db.contactLead.count(),
    db.contactLead.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    db.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { select: { name: true } } },
    }),
    db.page.findFirst({ where: { type: 'HOME', deletedAt: null }, select: { id: true } }),
  ]);
  return {
    metrics: { publishedPages, draftPages, mediaCount, newContacts, totalContacts },
    recentContacts,
    recentActivity: recentActivity.map((entry) => ({
      ...entry,
      actorName: entry.adminUser?.name || 'Hệ thống',
    })),
    homePageId: homePage?.id || null,
  };
}
