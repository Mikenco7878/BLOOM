import { endpoint, readJson, success } from '@/lib/api-response';
import { getSettings, updateSettings } from '@/features/settings/settings.service';

export const GET = endpoint(async () => success(await getSettings()), { admin: true });
export const PATCH = endpoint(
  async (request, _context, actor) =>
    success(await updateSettings(await readJson(request, 32768), actor)),
  { admin: true, mutation: true },
);
