'use client';
import ui from '@/components/admin/AdminUI.module.css';
export default function AdminError({ reset }) {
  return (
    <section className={ui.panel}>
      <h1>Không thể tải nội dung quản trị</h1>
      <p>Hệ thống tạm thời không khả dụng. Hãy thử lại sau ít phút.</p>
      <button className={ui.button} onClick={reset}>
        Thử lại
      </button>
    </section>
  );
}
