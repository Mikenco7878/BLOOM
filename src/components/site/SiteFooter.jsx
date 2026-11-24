import Link from 'next/link';
import { Sprout, Mail, Phone, Facebook } from 'lucide-react';
import MediaImage from '@/components/ui/MediaImage';
import styles from './SiteFooter.module.css';

export default function SiteFooter({ settings = {}, navigation = [], media = {} }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.story}>
          <Link href="/" className={styles.brand}>
            {settings.logoMediaId && media[settings.logoMediaId] ? (
              <MediaImage asset={media[settings.logoMediaId]} className={styles.logo} />
            ) : (
              <>
                <Sprout size={32} strokeWidth={1.3} />
                <span>{settings.siteName || 'BLOOM'}</span>
              </>
            )}
          </Link>
          <p>{settings.tagline}</p>
          <span className={styles.credit}>
            EXE101 Group 1<br />
            FPT University
          </span>
        </div>
        <div>
          <h2>Khám phá BLOOM</h2>
          <nav aria-label="Điều hướng chân trang" className={styles.links}>
            {navigation.map((page) => (
              <Link key={page.id || page.slug || 'home'} href={page.slug ? `/${page.slug}` : '/'}>
                {page.navLabel || page.title}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Cùng kết nối</h2>
          <div className={styles.links}>
            <Link href="/quy-trinh">Quy trình nghiên cứu</Link>
            <Link href="/du-an">Dự án EXE101</Link>
            <Link href="/lien-he">Liên hệ hợp tác</Link>
            {settings.email && (
              <a href={`mailto:${settings.email}`}>
                <Mail size={16} />
                {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`}>
                <Phone size={16} />
                {settings.phone}
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} rel="noopener noreferrer" target="_blank">
                <Facebook size={16} />
                Facebook BLOOM
              </a>
            )}
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <p>{settings.footerText || 'BLOOM · Dự án phát triển viên nén từ xơ dừa.'}</p>
        <span>Nuôi dưỡng những khởi đầu xanh.</span>
      </div>
    </footer>
  );
}
