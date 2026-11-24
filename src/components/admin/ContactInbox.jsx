'use client';
import { Mail, X, Inbox } from 'lucide-react';
import { useContactInbox } from '@/hooks/useContactInbox';
import Feedback from './Feedback';
import Pagination from './Pagination';
import ui from './AdminUI.module.css';
import styles from './ContactInbox.module.css';
const statuses = { NEW: 'Mới', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã xử lý', SPAM: 'Spam' };
const subjects = {
  PRODUCT: 'Tìm hiểu sản phẩm',
  PARTNERSHIP: 'Hợp tác',
  DISTRIBUTION: 'Phân phối / đại lý',
  OTHER: 'Khác',
};
export default function ContactInbox({ initialStatus = '', initialLead = '' }) {
  const state = useContactInbox(initialStatus, initialLead);
  const selected = state.selected;
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>KẾT NỐI VỚI BLOOM</p>
          <h1>Hộp thư liên hệ</h1>
          <p>Tiếp nhận nhu cầu, theo dõi phản hồi và giữ thông tin chỉ trong nội bộ.</p>
        </div>
        <span className={ui.badge}>{state.data?.total || 0} liên hệ</span>
      </div>
      <div className={ui.toolbar}>
        <input
          className={ui.search}
          value={state.search}
          onChange={(event) => state.setSearch(event.target.value)}
          aria-label="Tìm liên hệ"
          placeholder="Tìm tên, email hoặc chủ đề…"
        />
        <label className={ui.field}>
          <span className="sr-only">Lọc trạng thái</span>
          <select value={state.status} onChange={(event) => state.setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statuses).map(([key, value]) => (
              <option value={key} key={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Feedback loading={state.loading} error={state.error} notice={state.notice} />
      <div className={styles.layout}>
        <div>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Chủ đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {state.data?.items?.map((lead) => (
                  <tr key={lead.id} className={selected?.id === lead.id ? styles.selected : ''}>
                    <td>
                      <button onClick={() => state.setSelected(lead)} className={styles.name}>
                        {lead.name}
                      </button>
                      <small>{lead.email}</small>
                    </td>
                    <td>{subjects[lead.subject] || lead.subject}</td>
                    <td>
                      <span className={`${ui.badge} ${lead.status === 'NEW' ? ui.draft : ''}`}>
                        {statuses[lead.status]}
                      </span>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!state.loading && !state.data?.items?.length && (
              <div className={ui.empty}>
                <Inbox size={34} strokeWidth={1.2} />
                <p>
                  Chưa có liên hệ phù hợp.
                  <br />
                  Yêu cầu từ biểu mẫu website sẽ được lưu tại đây.
                </p>
              </div>
            )}
          </div>
          <Pagination page={state.page} total={state.data?.total} onChange={state.setPage} />
        </div>
        {selected && (
          <aside className={styles.detail} key={selected.id}>
            <div className={styles.detailHeading}>
              <h2>Chi tiết liên hệ</h2>
              <button
                className={ui.iconButton}
                onClick={() => state.setSelected(null)}
                aria-label="Đóng chi tiết"
              >
                <X size={17} />
              </button>
            </div>
            <h3>{selected.name}</h3>
            <a href={`mailto:${selected.email}`} className={styles.email}>
              <Mail size={15} />
              {selected.email}
            </a>
            {selected.phone && <p>{selected.phone}</p>}
            <dl className={styles.info}>
              <dt>Chủ đề</dt>
              <dd>{subjects[selected.subject] || selected.subject}</dd>
              <dt>Tiếp nhận</dt>
              <dd>{new Date(selected.createdAt).toLocaleString('vi-VN')}</dd>
              <dt>Đồng ý liên hệ</dt>
              <dd>
                {selected.consentAt
                  ? new Date(selected.consentAt).toLocaleString('vi-VN')
                  : 'Đã đồng ý'}
              </dd>
            </dl>
            <p className={ui.body}>{selected.message}</p>
            <hr className={ui.divider} />
            <form onSubmit={state.save}>
              <label className={ui.field}>
                Trạng thái xử lý
                <select name="status" defaultValue={selected.status}>
                  {Object.entries(statuses).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ui.field}>
                Ghi chú nội bộ
                <textarea
                  name="internalNote"
                  rows={4}
                  maxLength={3000}
                  defaultValue={selected.internalNote || ''}
                />
                <small>Chỉ quản trị viên có thể xem ghi chú.</small>
              </label>
              <div className={ui.actions}>
                <button className={ui.button} disabled={state.busy}>
                  {state.busy ? 'Đang lưu…' : 'Lưu xử lý'}
                </button>
                <button
                  type="button"
                  className={ui.danger}
                  disabled={state.busy}
                  onClick={state.remove}
                >
                  Xóa liên hệ
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </>
  );
}
