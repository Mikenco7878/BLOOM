'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Files,
  Images,
  Inbox,
  Settings,
  History,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sprout,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import styles from './AdminShell.module.css';

const links = [
  ['/admin', 'Tổng quan', LayoutDashboard],
  ['/admin/pages', 'Quản lý trang', Files],
  ['/admin/media', 'Thư viện ảnh', Images],
  ['/admin/contacts', 'Hộp thư liên hệ', Inbox],
  ['/admin/settings', 'Cài đặt website', Settings],
  ['/admin/activity', 'Lịch sử hoạt động', History],
];
export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const sidebar = useRef(null);
  const { logout, busy, error } = useAdminAuth();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    sidebar.current?.querySelector('a')?.focus();
    function keydown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === 'Tab') {
        const controls = [...sidebar.current.querySelectorAll('a,button')];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      previous?.focus();
    };
  }, [open]);
  return (
    <div className={styles.shell}>
      {open && (
        <button
          aria-label="Đóng menu quản trị"
          className={styles.backdrop}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="admin-navigation"
        ref={sidebar}
        className={`${styles.sidebar} ${open ? styles.open : ''}`}
        aria-label="Điều hướng quản trị"
      >
        <div className={styles.brand}>
          <Link href="/admin">
            <Sprout size={30} aria-hidden="true" />
            bloom<span>STUDIO</span>
          </Link>
          <button className={styles.close} onClick={() => setOpen(false)} aria-label="Đóng menu">
            <X size={22} />
          </button>
        </div>
        <p className={styles.caption}>KHÔNG GIAN QUẢN TRỊ</p>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={
                (href === '/admin' ? pathname === href : pathname.startsWith(href))
                  ? 'page'
                  : undefined
              }
              className={
                (href === '/admin' ? pathname === href : pathname.startsWith(href))
                  ? styles.active
                  : ''
              }
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.bottom}>
          <p>
            Mỗi cập nhật nhỏ,
            <br />
            một giá trị mới.
          </p>
          <Link href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            Xem website <span className="sr-only">(tab mới)</span>
          </Link>
          <button onClick={logout} disabled={busy}>
            <LogOut size={17} />
            {busy ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <button
              ref={toggle}
              onClick={() => setOpen(true)}
              className={styles.menu}
              aria-label="Mở menu quản trị"
              aria-controls="admin-navigation"
              aria-expanded={open}
            >
              <Menu size={22} />
            </button>
            <span>BLOOM / Content Management</span>
          </div>
          <div className={styles.account}>
            <span className={styles.avatar}>{admin.name?.slice(0, 1) || 'A'}</span>
            <span>
              {admin.name || 'Quản trị viên'}
              <small>ADMIN</small>
            </span>
          </div>
        </header>
        <main id="main-content" className={styles.main}>
          {children}
        </main>
        <footer className={styles.footer}>BLOOM · EXE101 Group 1 — FPT University</footer>
      </div>
    </div>
  );
}
