'use client';
import { useState } from 'react';
import { useAdminResource } from '@/hooks/useAdminResource';
import Feedback from './Feedback';
import Pagination from './Pagination';
import ui from './AdminUI.module.css';
const actions = {
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  PAGE_CREATED: 'Tạo trang',
  PAGE_UPDATED: 'Lưu bản nháp',
  PAGE_PUBLISHED: 'Xuất bản trang',
  PAGE_UNPUBLISHED: 'Gỡ xuất bản',
  PAGE_DELETED: 'Xóa trang',
  MEDIA_UPLOADED: 'Tải ảnh lên',
  MEDIA_UPDATED: 'Cập nhật ảnh',
  MEDIA_REMOVED: 'Xóa ảnh',
  CONTACT_STATUS_UPDATED: 'Xử lý liên hệ',
  CONTACT_DELETED: 'Xóa liên hệ',
  SETTINGS_UPDATED: 'Cập nhật cài đặt',
};
export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminResource(
    `/api/v1/admin/audit?search=${encodeURIComponent(search)}&page=${page}&pageSize=12`,
  );
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>MINH BẠCH TRONG TỪNG CẬP NHẬT</p>
          <h1>Lịch sử hoạt động</h1>
          <p>Theo dõi những thay đổi quan trọng trong hệ thống quản trị.</p>
        </div>
      </div>
      <div className={ui.toolbar}>
        <input
          className={ui.search}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Tìm hoạt động"
          placeholder="Tìm hành động hoặc nội dung thay đổi…"
        />
      </div>
      <Feedback loading={loading} error={error} />
      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Hành động</th>
              <th>Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td>{log.actorName || 'Hệ thống'}</td>
                <td>
                  <span className={ui.badge}>{actions[log.action] || log.action}</span>
                </td>
                <td>{log.summary || log.metadataJson?.summary || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data?.items?.length && <p className={ui.empty}>Chưa có hoạt động phù hợp.</p>}
      </div>
      <Pagination page={page} total={data?.total} onChange={setPage} />
    </>
  );
}
