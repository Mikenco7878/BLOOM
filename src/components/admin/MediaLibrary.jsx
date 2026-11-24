'use client';
import { useState } from 'react';
import { UploadCloud, ImageIcon, Pencil, Trash2, X } from 'lucide-react';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import Feedback from './Feedback';
import Pagination from './Pagination';
import ui from './AdminUI.module.css';
import styles from './MediaLibrary.module.css';
export default function MediaLibrary() {
  const state = useMediaPicker();
  const [editing, setEditing] = useState(null);
  async function remove(asset) {
    if (window.confirm(`Xóa ảnh “${asset.filename}”? Ảnh đang được dùng sẽ không thể xóa.`))
      await state.mutate(
        `/api/v1/admin/media/${asset.id}`,
        { method: 'DELETE' },
        'Đã xóa ảnh khỏi thư viện.',
      );
  }
  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const asset = await state.mutate(
      `/api/v1/admin/media/${editing.id}`,
      { method: 'PATCH', body: { altText: form.get('altText'), caption: form.get('caption') } },
      'Đã cập nhật thông tin ảnh.',
    );
    if (asset) setEditing(null);
  }
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>TƯ LIỆU THƯƠNG HIỆU</p>
          <h1>Thư viện hình ảnh</h1>
          <p>Lưu giữ hình ảnh để kể câu chuyện BLOOM một cách chân thực.</p>
        </div>
        <span className={ui.badge}>{state.data?.total || 0} hình ảnh</span>
      </div>
      <form className={styles.upload} onSubmit={state.upload}>
        <div className={styles.uploadIntro}>
          <UploadCloud size={34} strokeWidth={1.3} />
          <div>
            <h2>Thêm hình ảnh mới</h2>
            <p>JPG, PNG hoặc WebP · Tối đa 5 MB · Ảnh thật và minh họa cần ghi chú rõ.</p>
          </div>
        </div>
        <div className={styles.uploadFields}>
          <label className={ui.field}>
            Chọn tệp ảnh
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <label className={ui.field}>
            Văn bản thay thế
            <input
              name="altText"
              maxLength={300}
              required
              placeholder="Mô tả nội dung để hỗ trợ người đọc màn hình"
            />
          </label>
          <label className={ui.field}>
            Chú thích
            <input name="caption" maxLength={1000} placeholder="Nguồn ảnh hoặc ghi chú minh họa" />
          </label>
          <button type="submit" className={ui.button} disabled={state.busy}>
            {state.busy ? 'Đang tải lên…' : 'Tải lên thư viện'}
          </button>
        </div>
      </form>
      <Feedback loading={state.loading} error={state.error} notice={state.notice} />
      {editing && (
        <form key={editing.id} onSubmit={save} className={styles.edit}>
          <div className={styles.editHeading}>
            <h2>Chỉnh sửa ảnh · {editing.filename}</h2>
            <button
              type="button"
              className={ui.iconButton}
              onClick={() => setEditing(null)}
              aria-label="Đóng chỉnh sửa ảnh"
            >
              <X size={17} />
            </button>
          </div>
          <div className={ui.row}>
            <label className={ui.field}>
              Văn bản thay thế
              <input name="altText" defaultValue={editing.altText} maxLength={300} required />
            </label>
            <label className={ui.field}>
              Chú thích
              <input name="caption" defaultValue={editing.caption || ''} maxLength={1000} />
            </label>
          </div>
          <button className={ui.button} disabled={state.busy}>
            Lưu thông tin ảnh
          </button>
        </form>
      )}
      <div className={ui.toolbar}>
        <input
          value={state.search}
          className={ui.search}
          onChange={(event) => state.setSearch(event.target.value)}
          aria-label="Tìm hình ảnh"
          placeholder="Tìm theo tên hoặc mô tả ảnh…"
        />
      </div>
      <div className={styles.grid}>
        {state.data?.items?.map((asset) => (
          <article className={styles.card} key={asset.id}>
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Xem ảnh ${asset.filename} trong tab mới`}
            >
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.altText || asset.filename}
                width={300}
                height={200}
                loading="lazy"
              />
            </a>
            <div className={styles.info}>
              <h2 title={asset.filename}>{asset.filename}</h2>
              <p>
                {asset.width} × {asset.height} · {Math.round(asset.bytes / 1024)} KB
              </p>
              <p className={styles.alt}>{asset.altText || 'Chưa có mô tả'}</p>
              {asset.usages?.length > 0 && (
                <span className={ui.badge}>
                  Đang được sử dụng · {asset.usages.length} tham chiếu
                </span>
              )}
              <div className={styles.actions}>
                <button className={ui.secondary} onClick={() => setEditing(asset)}>
                  <Pencil size={14} />
                  Sửa mô tả
                </button>
                <button
                  disabled={state.busy}
                  className={ui.iconButton}
                  onClick={() => remove(asset)}
                  aria-label={`Xóa ảnh ${asset.filename}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!state.loading && !state.data?.items?.length && (
        <div className={ui.empty}>
          <ImageIcon size={36} strokeWidth={1.2} />
          <p>
            Thư viện chưa có hình ảnh phù hợp.
            <br />
            Tải lên ảnh của nhóm để dùng trong các section.
          </p>
        </div>
      )}
      <Pagination page={state.page} total={state.data?.total} onChange={state.setPage} />
    </>
  );
}
