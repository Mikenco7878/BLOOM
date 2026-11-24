'use client';
import Link from 'next/link';
import { useCreatePage } from '@/hooks/useCreatePage';
import Feedback from './Feedback';
import ui from './AdminUI.module.css';
export default function CreatePageForm() {
  const state = useCreatePage();
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>QUẢN LÝ TRANG</p>
          <h1>Tạo trang mới</h1>
          <p>Trang được tạo ở trạng thái bản nháp. Thêm nội dung trước khi xuất bản.</p>
        </div>
      </div>
      <form onSubmit={state.submit} className={`${ui.panel} ${ui.form}`}>
        <Feedback error={state.error} />
        <label className={ui.field}>
          Tiêu đề trang
          <input
            value={state.title}
            onChange={(event) => state.changeTitle(event.target.value)}
            required
            maxLength={180}
          />
        </label>
        <label className={ui.field}>
          Đường dẫn
          <input
            value={state.slug}
            onChange={(event) => state.changeSlug(event.target.value)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={120}
          />
          <small>
            Dùng chữ thường, số và dấu gạch ngang. Không dùng các đường dẫn hệ thống như admin, api.
          </small>
        </label>
        <label className={ui.field}>
          Mô tả SEO
          <textarea name="description" required minLength={10} maxLength={320} rows={3} />
        </label>
        <label className={ui.check}>
          <input type="checkbox" name="showInNav" />
          Hiển thị trong menu sau khi xuất bản
        </label>
        <hr className={ui.divider} />
        <div className={ui.actions}>
          <button type="submit" className={ui.button} disabled={state.busy}>
            {state.busy ? 'Đang tạo…' : 'Tạo bản nháp'}
          </button>
          <Link href="/admin/pages" className={ui.secondary}>
            Hủy
          </Link>
        </div>
      </form>
    </>
  );
}
