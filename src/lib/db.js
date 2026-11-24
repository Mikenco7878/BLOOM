import { PrismaClient } from '@prisma/client';

const globalDb = globalThis;
export const db = globalDb.bloomDb || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalDb.bloomDb = db;

// The shared lock makes reference checks and CMS mutations indivisible, including
// concurrent publish/upload deletion. PostgreSQL releases it at transaction end.
export async function cmsTransaction(callback) {
  return db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(1012026)`;
      return callback(tx);
    },
    { maxWait: 10000, timeout: 20000 },
  );
}
