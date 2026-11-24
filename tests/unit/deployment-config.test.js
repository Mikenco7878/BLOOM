import { describe, expect, it } from 'vitest';
import { checkDeploymentConfig } from '../../src/lib/deployment-config.js';

const valid = {
  SITE_URL: 'https://bloom.test',
  DATABASE_URL: 'postgresql://app:password@database.internal:5432/bloom',
  SESSION_SECRET: 'b45be401a4bfad58bde96ac93fe770a6b4504aed80c3b411d40609087f3fd456',
  STORAGE_PROVIDER: 'cloudinary',
  CLOUDINARY_CLOUD_NAME: 'bloom-project',
  CLOUDINARY_API_KEY: '123456789',
  CLOUDINARY_API_SECRET: 'test-only-secret',
  TRUST_PROXY: 'true',
};

describe('Production configuration gate', () => {
  it('accepts explicit production settings', () => {
    expect(checkDeploymentConfig(valid)).toEqual({ errors: [], warnings: [] });
  });

  it.each([
    'http://bloom.test',
    'https://localhost',
    'https://bloom.example.com',
    'https://bloom.test/path',
    'https://bloom.test/?preview=1',
    'https://user:secret@bloom.test',
    undefined,
  ])('rejects an unsafe or incorrect canonical domain: %s', (SITE_URL) => {
    expect(checkDeploymentConfig({ ...valid, SITE_URL }).errors.length).toBeGreaterThan(0);
  });

  it.each([
    { DATABASE_URL: 'mysql://app:password@database.internal/bloom' },
    { DATABASE_URL: 'postgresql://bloom:CHANGE_ME@localhost:5432/bloom' },
    { SESSION_SECRET: 'REPLACE_WITH_RANDOM_64_HEX_CHARACTERS' },
    { STORAGE_PROVIDER: 'local' },
    { CLOUDINARY_API_SECRET: '' },
    { ADMIN_PASSWORD: 'left-in-deployment' },
    { TRUST_PROXY: undefined },
  ])('rejects missing secrets and development-only configuration: %j', (override) => {
    expect(checkDeploymentConfig({ ...valid, ...override }).errors.length).toBeGreaterThan(0);
  });

  it('warns about shared contact throttling when proxy trust is disabled', () => {
    const result = checkDeploymentConfig({ ...valid, TRUST_PROXY: 'false' });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });
});
