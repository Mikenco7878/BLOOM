import { endpoint, readOptionalJson, success } from '@/lib/api-response';
import { publishPage } from '@/features/pages/page.service';
import { publishPageSchema } from '@/features/pages/page.schema';

export const POST = endpoint(
  async (request, context, actor) => {
    const { draftRevisionId } = publishPageSchema.parse(await readOptionalJson(request));
    return success(await publishPage((await context.params).id, actor, draftRevisionId));
  },
  { admin: true, mutation: true },
);
