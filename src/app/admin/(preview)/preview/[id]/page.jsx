import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getAdmin } from '@/lib/session';
import { getAdminPage } from '@/features/pages/page.service';
import { getAdminMediaMap } from '@/features/media/media.service';
import { getPublicSettings } from '@/features/settings/settings.service';
import SectionRenderer from '@/components/sections/SectionRenderer';
import styles from './preview.module.css';
export const dynamic = 'force-dynamic';
export default async function PreviewPage({ params }) {
  if (!(await getAdmin())) redirect('/admin/login');
  const { id } = await params;
  const [page, media, settings] = await Promise.all([
    getAdminPage(id).catch((error) => {
      if (error.status === 404) notFound();
      throw error;
    }),
    getAdminMediaMap(),
    getPublicSettings(),
  ]);
  return (
    <>
      <div className={styles.banner}>
        <span>BẢN XEM TRƯỚC · Chỉ quản trị viên có thể xem · {page.title}</span>
        <Link href={`/admin/pages/${id}/edit`}>Quay lại chỉnh sửa</Link>
      </div>
      <main id="main-content">
        <SectionRenderer sections={page.sections} media={media} settings={settings} />
      </main>
    </>
  );
}
