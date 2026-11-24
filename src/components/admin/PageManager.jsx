'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';
import Feedback from './Feedback';
import Pagination from './Pagination';
import ui from './AdminUI.module.css';

export default function PageManager({ initialStatus = '' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { data, loading, error, notice, busy, mutate } = useAdminResource(
    `/api/v1/admin/pages?search=${encodeURIComponent(search)}&status=${status}&page=${page}&pageSize=12`,
  );
  async function remove(item) {
    if (window.confirm(`Xóa trang “${item.title}”? Trang sẽ được gỡ khỏi website.`))
      await mutate(`/api/v1/admin/pages/${item.id}`, { method: 'DELETE' }, 'Đã xóa trang.');
  }
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>NỘI DUNG WEBSITE</p>
          <h1>Quản lý trang</h1>
          <p>Chỉnh sửa nội dung, lưu bản nháp và xuất bản khi sẵn sàng.</p>
        </div>
        <Link href="/admin/pages/new" className={ui.button}>
          <Plus size={17} />
          Tạo trang mới
        </Link>
      </div>
      <div className={ui.toolbar}>
        <input
          className={ui.search}
          aria-label="Tìm trang"
          placeholder="Tìm theo tiêu đề hoặc đường dẫn…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <label className={ui.field}>
          <span className="sr-only">Trạng thái trang</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="UNPUBLISHED">Đã gỡ xuất bản</option>
          </select>
        </label>
      </div>
      <Feedback loading={loading} error={error} notice={notice} />
      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Trang</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/admin/pages/${item.id}/edit`}>
                    <FileText size={15} aria-hidden="true" /> {item.title}
                  </Link>
                  <small>
                    /{item.slug || ''}
                    {item.type === 'HOME' ? ' · Trang chủ hệ thống' : ''}
                  </small>
                </td>
                <td>
                  <span
                    className={`${ui.badge} ${item.status === 'PUBLISHED' ? ui.published : ui.draft}`}
                  >
                    {item.status === 'PUBLISHED'
                      ? 'Đã xuất bản'
                      : item.status === 'UNPUBLISHED'
                        ? 'Đã gỡ xuất bản'
                        : 'Bản nháp'}
                  </span>
                </td>
                <td>{new Date(item.updatedAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={ui.actions}>
                    <Link href={`/admin/pages/${item.id}/edit`} className={ui.secondary}>
                      Chỉnh sửa
                    </Link>
                    {item.type !== 'HOME' && (
                      <button className={ui.danger} disabled={busy} onClick={() => remove(item)}>
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data?.items?.length && (
          <p className={ui.empty}>Chưa có trang phù hợp. Hãy tạo trang hoặc đổi bộ lọc.</p>
        )}
      </div>
      <Pagination page={page} total={data?.total} onChange={setPage} />
    </>
  );
}
