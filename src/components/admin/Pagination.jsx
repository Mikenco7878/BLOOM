import styles from './AdminUI.module.css';
export default function Pagination({ page, total, pageSize = 12, onChange }) {
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize));
  return (
    <nav className={styles.pagination} aria-label="Phân trang">
      <button
        type="button"
        className={styles.secondary}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Trước
      </button>
      <span>
        Trang {page} / {pages} · {total || 0} mục
      </span>
      <button
        type="button"
        className={styles.secondary}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Tiếp
      </button>
    </nav>
  );
}
