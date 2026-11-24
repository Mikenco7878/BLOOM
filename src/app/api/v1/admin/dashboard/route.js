import { endpoint, success } from '@/lib/api-response';
import { getDashboard } from '@/features/dashboard/dashboard.service';

export const GET = endpoint(async () => success(await getDashboard()), { admin: true });
