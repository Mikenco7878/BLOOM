import { endpoint, success } from '@/lib/api-response';
import { logout } from '@/features/auth/auth.service';

export const POST = endpoint(async (_request, _context, actor) => success(await logout(actor)), {
  admin: true,
  mutation: true,
});
