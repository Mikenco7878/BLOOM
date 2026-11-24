import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { cookies } from 'next/headers';
import { createSession, findAdminByEmail, revokeSession } from './auth.repository.js';
import { loginSchema } from './auth.schema.js';
import { rateLimit, requestAddress } from '../../lib/rate-limit.js';
import { HttpError } from '../../lib/errors.js';
import { hashToken, SESSION_COOKIE, sessionCookieOptions } from '../../lib/session.js';
import { audit } from '../audit/audit.service.js';

export async function login(input, request) {
  const data = loginSchema.parse(input);
  await rateLimit('login-address', requestAddress(request), 25, 900);
  await rateLimit('login-account', data.email, 5, 900);
  const admin = await findAdminByEmail(data.email);
  const valid = admin
    ? await argon2.verify(admin.passwordHash, data.password)
    : (await argon2.hash(data.password), false);
  if (!valid || !admin.isActive || admin.role !== 'ADMIN')
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
  const token = randomBytes(32).toString('hex');
  await createSession({
    adminUserId: admin.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
  await audit(admin.id, 'LOGIN', 'AdminUser', admin.id, 'Đăng nhập quản trị');
  return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
}

export async function logout(admin) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(hashToken(token));
  jar.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  await audit(admin.id, 'LOGOUT', 'AdminUser', admin.id, 'Đăng xuất quản trị');
  return { loggedOut: true };
}
