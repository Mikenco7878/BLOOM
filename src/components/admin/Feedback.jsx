import styles from './AdminUI.module.css';
export default function Feedback({ error, notice, loading, id }) {
  return (
    <>
      {error && (
        <div id={id} role="alert" className={`${styles.feedback} ${styles.error}`}>
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className={styles.feedback}>
          {notice}
        </div>
      )}
      {loading && (
        <p role="status" className={styles.muted}>
          Đang tải dữ liệu…
        </p>
      )}
    </>
  );
}
