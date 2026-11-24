import { createHash } from 'node:crypto';
import { db } from './db.js';
import { HttpError } from './errors.js';

export function requestAddress(request) {
  // Only opt into proxy headers when the production reverse proxy overwrites them.
  return process.env.TRUST_PROXY === 'true'
    ? (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
    : 'direct';
}

export async function rateLimit(scope, identity, maximum, windowSeconds) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  const key = `${scope}:${createHash('sha256').update(`${secret}:${identity}`).digest('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db.$queryRaw`
    INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "RateLimitBucket"."expiresAt" END
    RETURNING "count"`;
  if (rows[0].count > maximum)
    throw new HttpError(429, 'RATE_LIMITED', 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
  // Expired buckets contain only keyed hashes; keep the table bounded.
  await db.rateLimitBucket.deleteMany({
    where: { expiresAt: { lt: new Date(now.getTime() - 86400000) } },
  });
}
