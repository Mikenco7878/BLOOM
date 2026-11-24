import { z } from 'zod';

export const contactSubjects = ['PRODUCT', 'PARTNERSHIP', 'DISTRIBUTION', 'OTHER'];
export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự.').max(100),
    email: z.email('Email không hợp lệ.').max(254),
    phone: z
      .string()
      .max(20)
      .regex(/^[+\d\s().-]*$/, 'Số điện thoại không hợp lệ.')
      .optional()
      .default(''),
    subject: z.enum(contactSubjects),
    message: z.string().trim().min(10, 'Nội dung cần ít nhất 10 ký tự.').max(3000),
    consent: z.literal(true, { error: 'Vui lòng đồng ý để BLOOM phản hồi liên hệ.' }),
    website: z.string().max(200).optional().default(''),
    sourcePath: z
      .string()
      .max(240)
      .regex(/^\/(?!\/)[a-zA-Z0-9/_-]*$/)
      .optional()
      .default('/lien-he'),
  })
  .strict();
export const contactUpdateSchema = z
  .object({
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM']).optional(),
    internalNote: z.string().max(3000).optional(),
  })
  .strict();
