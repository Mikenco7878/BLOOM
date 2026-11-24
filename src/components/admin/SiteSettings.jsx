'use client';
import Link from 'next/link';
import { Save, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MediaField } from './StructuredFields';
import Feedback from './Feedback';
import ui from './AdminUI.module.css';
import styles from './SiteSettings.module.css';
export default function SiteSettings() {
  const state = useSiteSettings();
  const settings = state.settings;
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>THIẾT LẬP CHUNG</p>
          <h1>Cài đặt website</h1>
          <p>Quản lý nhận diện thương hiệu và thông tin liên hệ công khai.</p>
        </div>
        <Link href="/" target="_blank" rel="noreferrer" className={ui.secondary}>
          <ExternalLink size={16} />
          Xem website
        </Link>
      </div>
      <Feedback error={state.error} notice={state.notice} loading={!settings && !state.error} />
      {settings && (
        <form onSubmit={state.save}>
          <div className={styles.layout}>
            <div>
              <section className={ui.panel}>
                <h2>Nhận diện thương hiệu</h2>
                <label className={ui.field}>
                  Tên website
                  <input
                    value={settings.siteName || ''}
                    onChange={(event) => state.change('siteName', event.target.value)}
                    required
                    maxLength={100}
                  />
                </label>
                <label className={ui.field}>
                  Tagline
                  <input
                    value={settings.tagline || ''}
                    onChange={(event) => state.change('tagline', event.target.value)}
                    maxLength={300}
                  />
                </label>
                <MediaField
                  label="Logo website"
                  value={settings.logoMediaId}
                  onChange={(value) => state.change('logoMediaId', value)}
                />
                <MediaField
                  label="Favicon"
                  value={settings.faviconMediaId}
                  onChange={(value) => state.change('faviconMediaId', value)}
                />
                <MediaField
                  label="Ảnh chia sẻ mặc định"
                  value={settings.defaultOgImageId}
                  onChange={(value) => state.change('defaultOgImageId', value)}
                />
              </section>
              <section className={ui.panel}>
                <h2>Thông tin liên hệ công khai</h2>
                <p className={styles.hint}>
                  Chỉ nhập thông tin đã được nhóm xác nhận. Để trống các kênh chưa sử dụng.
                </p>
                <div className={ui.row}>
                  <label className={ui.field}>
                    Email liên hệ
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(event) => state.change('email', event.target.value)}
                      maxLength={254}
                    />
                  </label>
                  <label className={ui.field}>
                    Số điện thoại
                    <input
                      type="tel"
                      value={settings.phone || ''}
                      onChange={(event) => state.change('phone', event.target.value)}
                      maxLength={30}
                    />
                  </label>
                </div>
                <label className={ui.field}>
                  Đường dẫn Facebook
                  <input
                    type="url"
                    value={settings.facebookUrl || ''}
                    onChange={(event) => state.change('facebookUrl', event.target.value)}
                    placeholder="https://…"
                    maxLength={2048}
                  />
                  <small>Sử dụng đường dẫn HTTPS đến trang chính thức của nhóm.</small>
                </label>
              </section>
              <section className={ui.panel}>
                <h2>Chân trang</h2>
                <label className={ui.field}>
                  Nội dung footer
                  <textarea
                    value={settings.footerText || ''}
                    onChange={(event) => state.change('footerText', event.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                </label>
              </section>
            </div>
            <aside className={styles.aside}>
              <h2>Cập nhật có chủ đích</h2>
              <p>Thông tin trong cài đặt sẽ cập nhật trực tiếp lên website khi lưu.</p>
              <p>
                Để chỉnh tên và thứ tự menu, mở từng trang trong phần Quản lý trang → Trang, SEO và
                menu, sau đó xuất bản trang.
              </p>
              <Link href="/admin/pages" className={ui.secondary}>
                Quản lý menu trang
              </Link>
              <hr className={ui.divider} />
              <p className={ui.muted}>
                {state.dirty ? 'Có thay đổi chưa lưu.' : 'Cài đặt đã được lưu.'}
              </p>
              <button type="submit" className={ui.button} disabled={state.busy}>
                <Save size={16} />
                {state.busy ? 'Đang lưu…' : 'Lưu cài đặt'}
              </button>
            </aside>
          </div>
        </form>
      )}
    </>
  );
}
