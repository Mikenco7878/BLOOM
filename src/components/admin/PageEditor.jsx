'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Settings2,
  Eye,
  Save,
  Globe,
  GripVertical,
} from 'lucide-react';
import { usePageEditor } from '@/hooks/usePageEditor';
import StructuredFields, { MediaField } from './StructuredFields';
import { sectionFields, sectionLabels } from './section-fields';
import Feedback from './Feedback';
import ui from './AdminUI.module.css';
import styles from './PageEditor.module.css';

export default function PageEditor({ id }) {
  const state = usePageEditor(id);
  const [newType, setNewType] = useState('rich_text');
  const [dragged, setDragged] = useState(null);
  const page = state.page;
  const section = page?.sections?.find((item) => item.id === state.selected);
  if (!page)
    return (
      <>
        <Feedback error={state.error} loading={state.loading} />
        <Link href="/admin/pages">Quay về danh sách trang</Link>
      </>
    );
  return (
    <>
      <div className={ui.heading}>
        <div>
          <p className={ui.eyebrow}>
            PAGE EDITOR · {page.type === 'HOME' ? 'TRANG CHỦ' : 'TRANG NỘI DUNG'}
          </p>
          <h1>{page.title}</h1>
          <p>
            <span className={ui.badge}>
              {page.status === 'PUBLISHED' ? 'Đang xuất bản' : 'Bản nháp'}
            </span>{' '}
            <span>{state.dirty ? 'Có thay đổi chưa lưu' : 'Bản nháp đã lưu'}</span>
          </p>
        </div>
        <div className={ui.actions}>
          <button className={ui.secondary} disabled={state.busy} onClick={state.preview}>
            <Eye size={16} />
            Xem trước
          </button>
          <button className={ui.secondary} disabled={state.busy} onClick={state.save}>
            <Save size={16} />
            {state.busy ? 'Đang lưu…' : 'Lưu nháp'}
          </button>
          <button className={ui.button} disabled={state.busy} onClick={state.publish}>
            <Globe size={16} />
            Xuất bản
          </button>
        </div>
      </div>
      <Feedback id="page-editor-errors" error={state.error} notice={state.notice} />
      <div className={styles.notice}>
        Lưu nháp giữ nguyên nội dung đang công khai. “Xem trước” lưu bản nháp mới nhất và mở trang
        chỉ dành cho quản trị viên.
      </div>
      <div className={styles.editor}>
        <aside className={styles.sections}>
          <h2>
            Cấu trúc trang <span>{page.sections.length}</span>
          </h2>
          <button
            className={`${styles.metadata} ${!section ? styles.selected : ''}`}
            onClick={() => state.setSelected(null)}
          >
            <Settings2 size={17} />
            Trang, SEO và menu
          </button>
          <div className={styles.sectionList}>
            {page.sections.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.section} ${item.id === state.selected ? styles.selected : ''} ${!item.enabled ? styles.disabled : ''}`}
                draggable
                onDragStart={() => setDragged(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragged !== null) state.reorder(dragged, index);
                  setDragged(null);
                }}
              >
                <button className={styles.selectSection} onClick={() => state.setSelected(item.id)}>
                  <GripVertical size={15} aria-hidden="true" />
                  <span>
                    <strong>{item.data.heading || sectionLabels[item.type]}</strong>
                    <small>
                      {sectionLabels[item.type]}
                      {!item.enabled ? ' · Đang ẩn' : ''}
                    </small>
                  </span>
                </button>
                <div className={styles.order}>
                  <button
                    aria-label={`Đưa section ${index + 1} lên`}
                    disabled={index === 0}
                    onClick={() => state.reorder(index, index - 1)}
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    aria-label={`Đưa section ${index + 1} xuống`}
                    disabled={index === page.sections.length - 1}
                    onClick={() => state.reorder(index, index + 1)}
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.add}>
            <label className={ui.field}>
              Thêm section
              <select value={newType} onChange={(event) => setNewType(event.target.value)}>
                {Object.entries(sectionLabels).map(([type, label]) => (
                  <option value={type} key={type}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button className={ui.secondary} onClick={() => state.addSection(newType)}>
              <Plus size={16} />
              Thêm vào trang
            </button>
          </div>
        </aside>
        <section className={styles.properties}>
          {section ? (
            <>
              <div className={styles.propertiesHeading}>
                <h2>{sectionLabels[section.type]}</h2>
                <div className={ui.actions}>
                  <button
                    className={ui.iconButton}
                    onClick={() => state.duplicate(section)}
                    aria-label="Nhân bản section"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className={ui.iconButton}
                    onClick={() => state.remove(section.id)}
                    aria-label="Xóa section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <label className={ui.check}>
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(event) =>
                    state.updateSection(section.id, { enabled: event.target.checked })
                  }
                />
                Hiển thị section
              </label>
              <hr className={ui.divider} />
              <StructuredFields
                errors={state.fields}
                path={`sections.${page.sections.findIndex((item) => item.id === section.id)}.data`}
                value={section.data}
                onChange={(data) => state.updateSection(section.id, { data })}
                fields={[
                  { key: 'eyebrow', label: 'Dòng giới thiệu nhỏ', kind: 'text' },
                  { key: 'heading', label: 'Tiêu đề', kind: 'text' },
                  { key: 'description', label: 'Mô tả', kind: 'textarea' },
                  ...sectionFields[section.type],
                ]}
              />
            </>
          ) : (
            <>
              <h2>Thông tin trang</h2>
              <label className={ui.field}>
                Tiêu đề trang
                <input
                  value={page.title}
                  aria-invalid={state.fields.title ? true : undefined}
                  aria-describedby={state.fields.title ? 'page-editor-errors' : undefined}
                  maxLength={160}
                  onChange={(event) => state.change({ title: event.target.value })}
                />
              </label>
              <label className={ui.field}>
                Đường dẫn
                <input
                  value={page.slug}
                  aria-invalid={state.fields.slug ? true : undefined}
                  aria-describedby={state.fields.slug ? 'page-editor-errors' : undefined}
                  disabled={page.type === 'HOME'}
                  maxLength={120}
                  onChange={(event) => state.change({ slug: event.target.value })}
                />
                <small>
                  Khi đổi đường dẫn trang đã xuất bản, liên kết cũ được chuyển hướng sau khi xuất
                  bản.
                </small>
              </label>
              <label className={ui.field}>
                Tiêu đề SEO
                <input
                  value={page.seoTitle || ''}
                  aria-invalid={state.fields.seoTitle ? true : undefined}
                  aria-describedby={state.fields.seoTitle ? 'page-editor-errors' : undefined}
                  maxLength={180}
                  onChange={(event) => state.change({ seoTitle: event.target.value })}
                />
              </label>
              <label className={ui.field}>
                Mô tả SEO
                <textarea
                  value={page.seoDescription || ''}
                  aria-invalid={state.fields.seoDescription ? true : undefined}
                  aria-describedby={state.fields.seoDescription ? 'page-editor-errors' : undefined}
                  maxLength={320}
                  onChange={(event) => state.change({ seoDescription: event.target.value })}
                />
              </label>
              <MediaField
                label="Ảnh chia sẻ mạng xã hội"
                value={page.ogImageId}
                error={state.fields.ogImageId}
                onChange={(value) => state.change({ ogImageId: value })}
              />
              <hr className={ui.divider} />
              <h2>Điều hướng</h2>
              <label className={ui.field}>
                Tên trong menu
                <input
                  value={page.navLabel || ''}
                  aria-invalid={state.fields.navLabel ? true : undefined}
                  aria-describedby={state.fields.navLabel ? 'page-editor-errors' : undefined}
                  maxLength={60}
                  onChange={(event) => state.change({ navLabel: event.target.value })}
                />
              </label>
              <label className={ui.field}>
                Thứ tự menu
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={page.navOrder || 0}
                  onChange={(event) => state.change({ navOrder: Number(event.target.value) })}
                />
              </label>
              <label className={ui.check}>
                <input
                  type="checkbox"
                  checked={page.showInNav}
                  onChange={(event) => state.change({ showInNav: event.target.checked })}
                />
                Hiển thị trong menu
              </label>
              {page.status === 'PUBLISHED' && (
                <>
                  <hr className={ui.divider} />
                  <button className={ui.danger} disabled={state.busy} onClick={state.unpublish}>
                    Gỡ xuất bản trang
                  </button>
                </>
              )}
            </>
          )}
        </section>
        <aside className={styles.summary}>
          <p className={ui.eyebrow}>NỘI DUNG ĐANG CHỈNH</p>
          <div className={styles.miniBrand}>bloom</div>
          {section ? (
            <div className={styles.live}>
              <small>{section.data.eyebrow}</small>
              <h3>{section.data.heading}</h3>
              <p>{section.data.description || section.data.intro}</p>
              {section.data.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {(
                section.data.items ||
                section.data.steps ||
                section.data.milestones ||
                section.data.members
              )?.map((item, index) => (
                <div className={styles.previewItem} key={index}>
                  <strong>{item.title || item.question || item.name || item.label}</strong>
                  <p>
                    {item.description ||
                      item.answer ||
                      item.role ||
                      (item.amount !== undefined
                        ? `${item.amount.toLocaleString('vi-VN')} ${section.data.currency || 'VND'}`
                        : '')}
                  </p>
                </div>
              ))}
              {section.data.imageId && <span className={ui.badge}>Đã gắn ảnh từ thư viện</span>}
              {(section.data.primaryCta || section.data.cta)?.label && (
                <span className={styles.ctaPreview}>
                  {(section.data.primaryCta || section.data.cta).label}
                </span>
              )}
            </div>
          ) : (
            <>
              <h3>{page.seoTitle || page.title}</h3>
              <p>{page.seoDescription}</p>
              <small>/{page.slug}</small>
              <hr className={ui.divider} />
              <p>
                {page.sections.filter((item) => item.enabled).length} / {page.sections.length}{' '}
                section đang bật
              </p>
            </>
          )}
          <div className={styles.previewHint}>
            Bản tóm tắt nội dung. Chọn “Xem trước” để xem đầy đủ giao diện website.
          </div>
        </aside>
      </div>
    </>
  );
}
