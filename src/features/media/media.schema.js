import { z } from 'zod';

export const mediaMetadataSchema = z
  .object({ altText: z.string().max(500), caption: z.string().max(1000).optional() })
  .strict();
