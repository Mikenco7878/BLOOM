import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

const database = new PrismaClient();
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});
const prompt = createInterface({ input: process.stdin, output, terminal: true });
try {
  const email = (process.env.ADMIN_EMAIL || (await prompt.question('Admin email: ')))
    .trim()
    .toLowerCase();
  const name = (process.env.ADMIN_NAME || (await prompt.question('Admin name: '))).trim();
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    process.stdout.write('Password (hidden, at least 12 characters): ');
    muted = true;
    password = await prompt.question('');
    muted = false;
    process.stdout.write('\n');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new Error('Invalid email.');
  if (!name || name.length > 100) throw new Error('Name must contain 1–100 characters.');
  if (password.length < 12 || password.length > 128)
    throw new Error('Password must contain 12–128 characters.');
  const existing = await database.adminUser.findUnique({ where: { email } });
  if (existing) {
    const confirmation = await prompt.question(
      'Account exists. Reset password and revoke all sessions? Type RESET: ',
    );
    if (confirmation !== 'RESET') throw new Error('No account changed.');
  }
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });
  await database.$transaction(async (transaction) => {
    const user = await transaction.adminUser.upsert({
      where: { email },
      create: { email, name, passwordHash },
      update: { name, passwordHash, isActive: true, role: 'ADMIN' },
    });
    await transaction.adminSession.updateMany({
      where: { adminUserId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await transaction.auditLog.create({
      data: {
        adminUserId: user.id,
        action: existing ? 'ADMIN_PASSWORD_RESET' : 'ADMIN_CREATED',
        entityType: 'AdminUser',
        entityId: user.id,
        summary: existing
          ? 'Password reset through local CLI; all sessions revoked.'
          : 'Admin created through local CLI.',
      },
    });
  });
  console.log('Admin account ready. Sign in at /admin/login.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  prompt.close();
  await database.$disconnect();
}
