import { endpoint, listParams, success } from '@/lib/api-response';
import { listAudit } from '@/features/audit/audit.service';

export const GET = endpoint(async (request) => success(await listAudit(listParams(request))), {
  admin: true,
});
