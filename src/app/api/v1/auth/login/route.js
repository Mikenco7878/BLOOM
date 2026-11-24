import { endpoint, readJson, success } from '@/lib/api-response';
import { login } from '@/features/auth/auth.service';

export const POST = endpoint(
  async (request) => success(await login(await readJson(request, 4096), request)),
  { mutation: true },
);
