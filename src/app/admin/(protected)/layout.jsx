import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/session';
import AdminShell from '@/components/admin/AdminShell';
export const dynamic = 'force-dynamic';
export default async function ProtectedLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}
