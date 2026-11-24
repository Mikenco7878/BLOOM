'use client';
import { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import Feedback from './Feedback';
import Pagination from './Pagination';
import ui from './AdminUI.module.css';
import styles from './MediaPicker.module.css';
export default function MediaPicker({ value, onSelect, onClose }) {
  const dialog = useRef(null);
  const state = useMediaPicker();
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      onCancel={onClose}
      aria-labelledby="media-picker-title"
    >
      <div className={styles.heading}>
        <h2 id="media-picker-title">Chọn ảnh từ thư viện</h2>
        <button className={ui.iconButton} onClick={onClose} aria-label="Đóng thư viện">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={state.upload} className={styles.upload}>
        <label className={ui.field}>
          Tải ảnh mới
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        <label className={ui.field}>
          Văn bản thay thế
          <input name="altText" maxLength={300} required />
        </label>
        <button className={ui.secondary} type="submit" disabled={state.busy}>
          {state.busy ? 'Đang tải…' : 'Tải lên'}
        </button>
      </form>
      <label className={ui.field}>
        Tìm ảnh
        <input value={state.search} onChange={(event) => state.setSearch(event.target.value)} />
      </label>
      <Feedback loading={state.loading} error={state.error} notice={state.notice} />
      <div className={styles.grid}>
        {state.data?.items?.map((asset) => (
          <button
            type="button"
            className={`${styles.asset} ${value === asset.id ? styles.selected : ''}`}
            key={asset.id}
            onClick={() => {
              onSelect(asset.id);
              onClose();
            }}
          >
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.altText || asset.filename}
              width={160}
              height={120}
            />
            <span>{asset.filename}</span>
            {value === asset.id && <Check size={18} />}
          </button>
        ))}
      </div>
      {!state.loading && !state.data?.items?.length && (
        <p className={ui.empty}>Chưa có ảnh. Tải lên ảnh thật của nhóm để bắt đầu.</p>
      )}
      <Pagination page={state.page} total={state.data?.total} onChange={state.setPage} />
      <div className={styles.footer}>
        <button
          type="button"
          className={ui.secondary}
          onClick={() => {
            onSelect(null);
            onClose();
          }}
        >
          Bỏ chọn ảnh
        </button>
      </div>
    </dialog>
  );
}
