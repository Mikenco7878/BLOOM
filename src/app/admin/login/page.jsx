import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/session';
import LoginForm from '@/components/admin/LoginForm';
export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  return <LoginForm />;
}
