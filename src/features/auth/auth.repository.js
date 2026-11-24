import { db } from '../../lib/db.js';

export const findAdminByEmail = (email) => db.adminUser.findUnique({ where: { email } });
export const createSession = (data) => db.adminSession.create({ data });
export const findSession = (tokenHash) =>
  db.adminSession.findUnique({ where: { tokenHash }, include: { adminUser: true } });
export const revokeSession = (tokenHash) =>
  db.adminSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
