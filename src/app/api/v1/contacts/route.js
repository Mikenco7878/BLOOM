import { NextResponse } from 'next/server';
import { endpoint, readContactInput, success } from '@/lib/api-response';
import { submitContact } from '@/features/contacts/contact.service';

export const POST = endpoint(
  async (request) => {
    const { input, nativeForm } = await readContactInput(request);
    const result = await submitContact(input, request);
    if (nativeForm)
      return NextResponse.redirect(
        new URL('/lien-he?sent=1#contact-form', process.env.SITE_URL || request.url),
        303,
      );
    return success(result, 201, 'BLOOM đã nhận thông tin và sẽ phản hồi khi có thể.');
  },
  { mutation: true },
);
