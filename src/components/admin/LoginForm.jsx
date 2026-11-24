'use client';
import Link from 'next/link';
import { Sprout, LockKeyhole } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Feedback from './Feedback';
import ui from './AdminUI.module.css';
import styles from './LoginForm.module.css';
export default function LoginForm() {
  const { login, busy, error } = useAdminAuth();
  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.story}>
        <Link href="/" className={styles.logo}>
          <Sprout size={32} />
          bloom
        </Link>
        <div>
          <p className={styles.eyebrow}>BLOOM CONTENT STUDIO</p>
          <h1>
            Chăm chút câu chuyện.
            <br />
            Nuôi dưỡng giá trị.
          </h1>
          <p>
            Không gian để nhóm BLOOM cùng xây dựng và chia sẻ hành trình từ xơ dừa đến giá trị mới.
          </p>
        </div>
        <small>EXE101 Group 1 — FPT University</small>
      </section>
      <section className={styles.formArea}>
        <form onSubmit={login} className={styles.form}>
          <div className={styles.lock}>
            <LockKeyhole size={23} />
          </div>
          <p className={ui.eyebrow}>CHÀO MỪNG TRỞ LẠI</p>
          <h2>Đăng nhập quản trị</h2>
          <p className={styles.description}>Sử dụng tài khoản được cấp cho nhóm BLOOM.</p>
          <Feedback error={error} id="login-error" />
          <label className={ui.field}>
            Email
            <input
              type="email"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              name="email"
              autoComplete="username"
              required
              maxLength={254}
              placeholder="Email quản trị của bạn"
            />
          </label>
          <label className={ui.field}>
            Mật khẩu
            <input
              type="password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              name="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <button className={ui.button} disabled={busy} type="submit">
            {busy ? 'Đang xác thực…' : 'Đăng nhập'}
          </button>
          <p className={styles.help}>
            Cần quyền truy cập? Liên hệ người quản trị dự án để được cấp tài khoản.
          </p>
          <Link href="/" className={styles.back}>
            Về website BLOOM
          </Link>
        </form>
      </section>
    </main>
  );
}
