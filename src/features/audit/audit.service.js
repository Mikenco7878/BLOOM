import { db } from '../../lib/db.js';

export function audit(adminUserId, action, entityType, entityId, summary, client = db) {
  return client.auditLog.create({ data: { adminUserId, action, entityType, entityId, summary } });
}

export async function listAudit({ page = 1, pageSize = 20, q = '' } = {}) {
  const where = q
    ? {
        OR: [
          { action: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { adminUser: { select: { name: true } } },
    }),
    db.auditLog.count({ where }),
  ]);
  return {
    items: items.map((item) => ({ ...item, actorName: item.adminUser?.name || 'Hệ thống' })),
    total,
    page,
    pageSize,
  };
}
