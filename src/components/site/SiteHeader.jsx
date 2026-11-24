'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Sprout } from 'lucide-react';
import Button from '@/components/ui/Button';
import MediaImage from '@/components/ui/MediaImage';
import styles from './SiteHeader.module.css';

export default function SiteHeader({ navigation = [], settings = {}, media = {} }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    document.getElementById('site-navigation')?.querySelector('a')?.focus();
    const dismiss = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      document.getElementById('menu-toggle')?.focus();
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={`${settings.siteName || 'BLOOM'} — Trang chủ`}
          onClick={() => setOpen(false)}
        >
          {settings.logoMediaId && media[settings.logoMediaId] ? (
            <MediaImage asset={media[settings.logoMediaId]} className={styles.logo} />
          ) : (
            <>
              <Sprout size={33} strokeWidth={1.35} aria-hidden="true" />
              <span>{settings.siteName || 'BLOOM'}</span>
            </>
          )}
        </Link>
        <nav
          aria-label="Điều hướng chính"
          id="site-navigation"
          className={`${styles.nav} ${open ? styles.open : ''}`}
        >
          {navigation.map((page) => (
            <Link
              key={page.id || page.slug || 'home'}
              href={page.slug ? `/${page.slug}` : '/'}
              aria-current={pathname === (page.slug ? `/${page.slug}` : '/') ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {page.navLabel || page.title}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Button href="/lien-he" className={styles.contact}>
            Liên hệ hợp tác
          </Button>
          <button
            id="menu-toggle"
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="site-navigation"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <noscript>
        <nav aria-label="Điều hướng khi tắt JavaScript" className={styles.fallback}>
          {navigation.map((page) => (
            <a key={page.id || page.slug || 'home'} href={page.slug ? `/${page.slug}` : '/'}>
              {page.navLabel || page.title}
            </a>
          ))}
        </nav>
      </noscript>
    </header>
  );
}
