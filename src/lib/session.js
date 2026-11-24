import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { findSession } from '../features/auth/auth.repository.js';
import { HttpError } from './errors.js';

export const SESSION_COOKIE = 'bloom_admin';
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function getAdmin() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await findSession(hashToken(token));
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    !session.adminUser.isActive ||
    session.adminUser.role !== 'ADMIN'
  )
    return null;
  const { id, email, name, role } = session.adminUser;
  return { id, email, name, role };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new HttpError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập tài khoản quản trị.');
  return admin;
}

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 8 * 60 * 60,
});
