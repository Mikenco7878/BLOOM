import ui from '@/components/admin/AdminUI.module.css';
export default function AdminLoading() {
  return (
    <p role="status" className={ui.empty}>
      Đang tải không gian quản trị…
    </p>
  );
}
