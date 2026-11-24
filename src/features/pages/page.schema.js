import { z } from 'zod';

const text = (max = 3000) => z.string().max(max);
const short = text(240);
const mediaId = z.string().min(1).max(100).nullable().optional();
const imageId = mediaId;
export const safeHref = z
  .string()
  .min(1)
  .max(2048)
  .refine((value) => {
    if (/[\\\u0000-\u0020]/.test(value)) return false;
    if (/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) return true;
    if (value.startsWith('/') && !value.startsWith('//')) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Chỉ dùng đường dẫn nội bộ hoặc URL HTTPS hợp lệ.');
const cta = z.object({ label: z.string().min(1).max(100), href: safeHref }).strict();
const base = {
  eyebrow: short.optional(),
  heading: short.optional(),
  description: text().optional(),
};
const item = z
  .object({
    title: short,
    description: text(),
    iconKey: z
      .enum([
        'leaf',
        'recycle',
        'package',
        'shield',
        'sprout',
        'heart',
        'users',
        'globe',
        'check',
        'sun',
        'droplets',
      ])
      .optional(),
  })
  .strict();
const paragraphFields = { paragraphs: z.array(text()).max(30), imageId };
const dataSchemas = {
  hero: z
    .object({
      ...base,
      heading: z.string().min(1).max(240),
      imageId,
      primaryCta: cta.nullable().optional(),
      secondaryCta: cta.nullable().optional(),
    })
    .strict(),
  rich_text: z.object({ ...base, ...paragraphFields }).strict(),
  image_text: z
    .object({
      ...base,
      ...paragraphFields,
      imagePosition: z.enum(['left', 'right']).optional(),
      cta: cta.nullable().optional(),
    })
    .strict(),
  feature_grid: z.object({ ...base, items: z.array(item).max(12) }).strict(),
  esg_grid: z.object({ ...base, items: z.array(item).max(12) }).strict(),
  process_steps: z
    .object({
      ...base,
      steps: z.array(z.object({ title: short, description: text(), imageId }).strict()).max(20),
    })
    .strict(),
  gallery: z
    .object({
      ...base,
      imageIds: z.array(z.string().min(1).max(100)).max(40),
      captions: z.array(short).max(40).optional(),
    })
    .strict(),
  timeline: z
    .object({
      ...base,
      milestones: z
        .array(
          z
            .object({
              title: short,
              description: text(),
              status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
            })
            .strict(),
        )
        .max(30),
    })
    .strict(),
  faq: z
    .object({
      ...base,
      items: z.array(z.object({ question: short, answer: text() }).strict()).max(30),
    })
    .strict(),
  cta_banner: z
    .object({
      ...base,
      cta: cta.nullable().optional(),
      variant: z.enum(['forest', 'sage', 'cream']).optional(),
    })
    .strict(),
  contact_form: z.object({ ...base, intro: text().optional() }).strict(),
  budget_table: z
    .object({
      ...base,
      items: z
        .array(
          z
            .object({
              label: short,
              amount: z.number().nonnegative().max(1e12),
              explanation: text().optional(),
            })
            .strict(),
        )
        .max(50),
      currency: z.enum(['VND']).optional(),
      explanation: text().optional(),
    })
    .strict(),
  team_grid: z
    .object({
      ...base,
      members: z
        .array(
          z
            .object({ name: short, role: short, description: text().optional(), avatarId: mediaId })
            .strict(),
        )
        .max(30),
    })
    .strict(),
};

export const sectionTypes = Object.keys(dataSchemas);
export const sectionSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum(sectionTypes),
    enabled: z.boolean(),
    sortOrder: z.number().int().min(0).max(1000),
    data: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((section, ctx) => {
    const result = dataSchemas[section.type].safeParse(section.data);
    if (!result.success)
      for (const issue of result.error.issues)
        ctx.addIssue({ ...issue, path: ['data', ...issue.path] });
  });

const reserved = new Set([
  'admin',
  'api',
  'login',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'uploads',
  'brand',
  'placeholders',
]);
export const slugSchema = z
  .string()
  .max(120)
  .regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.')
  .refine((value) => !reserved.has(value), 'Đường dẫn dành riêng cho hệ thống.');
export const pageContentSchema = z
  .object({
    title: z.string().min(1).max(160),
    slug: slugSchema,
    navLabel: text(60).default(''),
    showInNav: z.boolean().default(false),
    navOrder: z.number().int().min(0).max(1000).default(0),
    seoTitle: text(180).default(''),
    seoDescription: text(320).default(''),
    ogImageId: mediaId,
    sections: z.array(sectionSchema).max(80).default([]),
  })
  .strict()
  .superRefine((content, ctx) => {
    const ids = content.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', path: ['sections'], message: 'ID section phải duy nhất.' });
  });

export const createPageSchema = z
  .object({
    title: z.string().min(1).max(160),
    slug: slugSchema,
    type: z.literal('STANDARD').optional(),
    navLabel: text(60).optional(),
    showInNav: z.boolean().optional(),
    navOrder: z.number().int().min(0).max(1000).optional(),
    seoTitle: text(180).optional(),
    seoDescription: text(320).optional(),
    ogImageId: mediaId,
    sections: z.array(sectionSchema).max(80).optional(),
  })
  .strict();
export const updatePageSchema = createPageSchema
  .omit({ type: true })
  .partial()
  .extend({ updatedAt: z.iso.datetime().optional() })
  .strict();
export const publishPageSchema = z
  .object({ draftRevisionId: z.string().min(1).max(100).optional() })
  .strict();
