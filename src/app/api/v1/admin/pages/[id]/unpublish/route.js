import { endpoint, success } from '@/lib/api-response';
import { unpublishPage } from '@/features/pages/page.service';

export const POST = endpoint(
  async (_request, context, actor) =>
    success(await unpublishPage((await context.params).id, actor)),
  { admin: true, mutation: true },
);
