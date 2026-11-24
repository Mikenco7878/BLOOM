import { endpoint, listParams, readJson, success } from '@/lib/api-response';
import { createPage, listPages } from '@/features/pages/page.service';

export const GET = endpoint(async (request) => success(await listPages(listParams(request))), {
  admin: true,
});
export const POST = endpoint(
  async (request, _context, actor) =>
    success(await createPage(await readJson(request), actor), 201),
  { admin: true, mutation: true },
);
