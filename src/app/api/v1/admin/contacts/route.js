import { endpoint, listParams, success } from '@/lib/api-response';
import { listContacts } from '@/features/contacts/contact.service';

export const GET = endpoint(async (request) => success(await listContacts(listParams(request))), {
  admin: true,
});
