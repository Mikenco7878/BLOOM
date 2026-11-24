'use client';
import Link from 'next/link';
import { Files, FileEdit, Images, Inbox, Plus, Leaf } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';
import Feedback from './Feedback';
import ui from './AdminUI.module.css';
import styles from './Dashboard.module.css';
const labels = { NEW: 'Mới', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã xử lý', SPAM: 'Spam' };
export default function Dashboard() {
  const { data, loading, error, reload } = useAdminResource('/api/v1/admin/dashboard');
  const metrics = data?.metrics;
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>BLOOM STUDIO</p>
          <h1>Tổng quan website</h1>
          <p>Một góc nhìn rõ ràng về nội dung và những kết nối mới.</p>
        </div>
        <Link href="/admin/pages/new" className={ui.button}>
          <Plus size={17} />
          Tạo trang mới
        </Link>
      </div>
      <Feedback error={error} loading={loading} />
      {error && (
        <button className={ui.secondary} onClick={reload}>
          Thử lại
        </button>
      )}
      {data && (
        <>
          <div className={styles.metrics}>
            {[
              [
                metrics?.publishedPages,
                'Trang đã xuất bản',
                Files,
                '/admin/pages?status=PUBLISHED',
              ],
              [metrics?.draftPages, 'Trang chưa xuất bản', FileEdit, '/admin/pages?status=DRAFT'],
              [metrics?.mediaCount, 'Ảnh trong thư viện', Images, '/admin/media'],
              [metrics?.newContacts, 'Liên hệ mới', Inbox, '/admin/contacts?status=NEW'],
            ].map(([value, label, Icon, href]) => (
              <Link key={label} href={href} className={styles.metric}>
                <span className={styles.metricIcon}>
                  <Icon size={20} />
                </span>
                <span className={styles.metricValue}>{value ?? 0}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <section className={styles.welcome}>
            <div>
              <p className={ui.eyebrow}>TIẾP TỤC CÂU CHUYỆN BLOOM</p>
              <h2>Nội dung tốt bắt đầu từ sự chăm chút.</h2>
              <p>Cập nhật website, chia sẻ hành trình và giữ kết nối với những người quan tâm.</p>
              <div className={ui.actions}>
                {data.homePageId && (
                  <Link href={`/admin/pages/${data.homePageId}/edit`} className={ui.button}>
                    Chỉnh sửa trang chủ
                  </Link>
                )}
                <Link href="/admin/media" className={ui.secondary}>
                  Thêm hình ảnh
                </Link>
              </div>
            </div>
            <Leaf className={styles.leaf} size={120} strokeWidth={0.7} aria-hidden="true" />
          </section>
          <div className={styles.columns}>
            <section className={ui.panel}>
              <div className={styles.panelHeading}>
                <h2>Liên hệ gần đây</h2>
                <Link href="/admin/contacts">Xem tất cả</Link>
              </div>
              {data.recentContacts?.length ? (
                data.recentContacts.map((lead) => (
                  <Link
                    href={`/admin/contacts?lead=${lead.id}`}
                    key={lead.id}
                    className={styles.lead}
                  >
                    <span className={styles.initial}>{lead.name.slice(0, 1)}</span>
                    <span>
                      <strong>{lead.name}</strong>
                      <small>
                        {lead.subject} · {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                      </small>
                    </span>
                    <span className={ui.badge}>{labels[lead.status] || lead.status}</span>
                  </Link>
                ))
              ) : (
                <p className={ui.empty}>
                  Chưa có liên hệ. Những yêu cầu từ website sẽ xuất hiện tại đây.
                </p>
              )}
            </section>
            <section className={ui.panel}>
              <div className={styles.panelHeading}>
                <h2>Hoạt động gần đây</h2>
                <Link href="/admin/activity">Lịch sử</Link>
              </div>
              {data.recentActivity?.length ? (
                data.recentActivity.map((log) => (
                  <div className={styles.activity} key={log.id}>
                    <span className={styles.dot} />
                    <div>
                      <p>{log.summary || log.metadataJson?.summary || log.action}</p>
                      <small>{new Date(log.createdAt).toLocaleString('vi-VN')}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className={ui.empty}>Các thay đổi quản trị sẽ được ghi nhận tại đây.</p>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
