import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookie, lookup } = vi.hoisted(() => ({ cookie: vi.fn(), lookup: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: cookie }) }));
vi.mock('../../src/features/auth/auth.repository.js', () => ({ findSession: lookup }));
import { getAdmin, hashToken, requireAdmin } from '../../src/lib/session.js';

describe('server admin session gate', () => {
  const token = 'a'.repeat(64);
  const session = () => ({
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    adminUser: {
      id: 'admin',
      email: 'test@example.com',
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      passwordHash: 'private',
    },
  });
  beforeEach(() => {
    cookie.mockReset();
    lookup.mockReset();
  });
  it('rejects missing and malformed session cookies before querying persistence', async () => {
    expect(await getAdmin()).toBeNull();
    cookie.mockReturnValue({ value: 'invalid-token' });
    expect(await getAdmin()).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });
  it('queries only a token hash and returns a minimal admin identity', async () => {
    cookie.mockReturnValue({ value: token });
    lookup.mockResolvedValue(session());
    expect(await getAdmin()).toEqual({
      id: 'admin',
      email: 'test@example.com',
      name: 'Admin',
      role: 'ADMIN',
    });
    expect(lookup).toHaveBeenCalledWith(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });
  it.each(['expired', 'revoked', 'inactive', 'wrong-role', 'absent'])(
    'rejects %s sessions',
    async (condition) => {
      cookie.mockReturnValue({ value: token });
      const value = session();
      if (condition === 'expired') value.expiresAt = new Date(0);
      if (condition === 'revoked') value.revokedAt = new Date();
      if (condition === 'inactive') value.adminUser.isActive = false;
      if (condition === 'wrong-role') value.adminUser.role = 'VISITOR';
      lookup.mockResolvedValue(condition === 'absent' ? null : value);
      expect(await getAdmin()).toBeNull();
    },
  );
  it('protected API callers receive 401 without a live session', async () => {
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });
});
