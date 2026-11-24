import { endpoint, listParams, readUploadForm, success } from '@/lib/api-response';
import { listMedia, uploadMedia } from '@/features/media/media.service';

export const GET = endpoint(async (request) => success(await listMedia(listParams(request))), {
  admin: true,
});
export const POST = endpoint(
  async (request, _context, actor) =>
    success(await uploadMedia(await readUploadForm(request), actor), 201),
  { admin: true, mutation: true },
);
