import { z } from 'zod';

const mediaId = z.string().min(1).max(100).nullable().optional();
export const settingsSchema = z
  .object({
    siteName: z.string().min(1).max(100).optional(),
    tagline: z.string().max(300).optional(),
    logoMediaId: mediaId,
    faviconMediaId: mediaId,
    defaultOgImageId: mediaId,
    email: z.union([z.email().max(254), z.literal('')]).optional(),
    phone: z
      .string()
      .max(30)
      .regex(/^[+\d\s().-]*$/)
      .optional(),
    facebookUrl: z
      .union([
        z
          .url()
          .max(2048)
          .refine((value) => {
            try {
              const url = new URL(value);
              return url.protocol === 'https:' && !url.username && !url.password;
            } catch {
              return false;
            }
          }, 'Chỉ chấp nhận URL HTTPS.'),
        z.literal(''),
      ])
      .optional(),
    footerText: z.string().max(1000).optional(),
  })
  .strict();
