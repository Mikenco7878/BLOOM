import { endpoint, readJson, success } from '@/lib/api-response';
import { deletePage, getAdminPage, savePage } from '@/features/pages/page.service';

export const GET = endpoint(
  async (_request, context) => success(await getAdminPage((await context.params).id)),
  { admin: true },
);
export const PATCH = endpoint(
  async (request, context, actor) =>
    success(await savePage((await context.params).id, await readJson(request), actor)),
  { admin: true, mutation: true },
);
export const DELETE = endpoint(
  async (_request, context, actor) => success(await deletePage((await context.params).id, actor)),
  { admin: true, mutation: true },
);
