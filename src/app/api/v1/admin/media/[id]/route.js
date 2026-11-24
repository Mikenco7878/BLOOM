import { endpoint, readJson, success } from '@/lib/api-response';
import { deleteMedia, editMedia } from '@/features/media/media.service';

export const PATCH = endpoint(
  async (request, context, actor) =>
    success(await editMedia((await context.params).id, await readJson(request, 8192), actor)),
  { admin: true, mutation: true },
);
export const DELETE = endpoint(
  async (_request, context, actor) => success(await deleteMedia((await context.params).id, actor)),
  { admin: true, mutation: true },
);
