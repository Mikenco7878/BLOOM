import { describe, expect, it } from 'vitest';
import { contactSchema, contactUpdateSchema } from '../../src/features/contacts/contact.schema.js';

const valid = {
  name: 'Nguyễn An',
  email: 'an@example.com',
  subject: 'PARTNERSHIP',
  message: 'Tôi muốn tìm hiểu hợp tác với BLOOM.',
  consent: true,
  website: '',
};
describe('contact privacy and validation', () => {
  it('accepts a minimal consented enquiry and normalizes optional fields', () => {
    expect(contactSchema.parse(valid)).toMatchObject({
      phone: '',
      sourcePath: '/lien-he',
      consent: true,
    });
  });
  it.each([
    { email: 'invalid' },
    { consent: false },
    { name: 'A' },
    { message: 'short' },
    { message: 'x'.repeat(3001) },
    { subject: 'FAKE' },
    { phone: 'x'.repeat(21) },
    { sourcePath: '//evil.example' },
    { internalNote: 'public injection' },
    { status: 'RESOLVED' },
  ])('rejects invalid visitor input %j', (patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it('limits private updates to valid workflow status and bounded internal notes', () => {
    expect(
      contactUpdateSchema.safeParse({ status: 'RESOLVED', internalNote: 'Đã phản hồi.' }).success,
    ).toBe(true);
    expect(
      contactUpdateSchema.safeParse({ status: 'ADMIN', email: 'overwrite@example.com' }).success,
    ).toBe(false);
  });
});
