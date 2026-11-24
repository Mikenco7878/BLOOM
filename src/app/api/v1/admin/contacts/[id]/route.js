import { endpoint, readJson, success } from '@/lib/api-response';
import { deleteContact, editContact, getContact } from '@/features/contacts/contact.service';

export const GET = endpoint(
  async (_request, context) => success(await getContact((await context.params).id)),
  { admin: true },
);
export const PATCH = endpoint(
  async (request, context, actor) =>
    success(await editContact((await context.params).id, await readJson(request, 16384), actor)),
  { admin: true, mutation: true },
);
export const DELETE = endpoint(
  async (_request, context, actor) =>
    success(await deleteContact((await context.params).id, actor)),
  { admin: true, mutation: true },
);
