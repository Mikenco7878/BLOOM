import { describe, expect, it } from 'vitest';
import {
  createPageSchema,
  pageContentSchema,
  safeHref,
  sectionSchema,
  slugSchema,
} from '../../src/features/pages/page.schema.js';

describe('CMS trust boundary', () => {
  it.each([
    'javascript:alert(1)',
    '//evil.test',
    '/\\evil.test',
    'data:text/html,hello',
    'https://user:pass@example.com',
    '/bad\npath',
  ])('rejects unsafe link %s', (href) => {
    expect(safeHref.safeParse(href).success).toBe(false);
  });
  it.each(['/san-pham', 'https://example.com/info'])('allows a safe link %s', (href) => {
    expect(safeHref.safeParse(href).success).toBe(true);
  });
  it.each(['admin', 'api', '_next', 'robots.txt', 'uploads', 'CAPITAL', '../escape'])(
    'rejects reserved/unsafe slug %s',
    (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    },
  );
  it('refuses unexpected executable fields and arbitrary block types', () => {
    expect(
      createPageSchema.safeParse({ title: 'Page', slug: 'page', script: '<script />' }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({ id: 'x', type: 'raw_html', enabled: true, sortOrder: 0, data: {} })
        .success,
    ).toBe(false);
  });
  it('rejects duplicate section IDs so reorder cannot overwrite another block', () => {
    const section = {
      id: 'same',
      type: 'hero',
      enabled: true,
      sortOrder: 0,
      data: { heading: 'Hello' },
    };
    expect(
      pageContentSchema.safeParse({ title: 'Page', slug: 'page', sections: [section, section] })
        .success,
    ).toBe(false);
  });
  it('rejects unsafe nested hero CTA and invalid milestone status', () => {
    expect(
      sectionSchema.safeParse({
        id: 'hero',
        type: 'hero',
        enabled: true,
        sortOrder: 0,
        data: { heading: 'Hello', primaryCta: { label: 'Go', href: 'javascript:alert(1)' } },
      }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({
        id: 'timeline',
        type: 'timeline',
        enabled: true,
        sortOrder: 0,
        data: { milestones: [{ title: 'Test', description: '', status: 'FAKE' }] },
      }).success,
    ).toBe(false);
  });
});
