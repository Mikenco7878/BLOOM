'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import { createSection } from '@/components/admin/section-fields';
export function usePageEditor(id) {
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    let alive = true;
    api(`/api/v1/admin/pages/${id}`)
      .then((result) => {
        if (alive) {
          setPage(result);
          setSelected(result.sections?.[0]?.id || null);
          setLoading(false);
        }
      })
      .catch((cause) => {
        if (alive) {
          setError(cause.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [id]);
  useEffect(() => {
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    function confirmNavigation(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      )
        return;
      if (!window.confirm('Bạn có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.addEventListener('click', confirmNavigation, true);
    return () => document.removeEventListener('click', confirmNavigation, true);
  }, [dirty]);
  function change(updater) {
    setPage((current) =>
      typeof updater === 'function' ? updater(current) : { ...current, ...updater },
    );
    setDirty(true);
    setNotice('');
  }
  function updateSection(sectionId, patch) {
    change((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    }));
  }
  function addSection(type) {
    const block = createSection(type);
    change((current) => ({
      ...current,
      sections: [...current.sections, { ...block, sortOrder: current.sections.length }],
    }));
    setSelected(block.id);
  }
  function duplicate(section) {
    const copy = structuredClone(section);
    copy.id = crypto.randomUUID();
    change((current) => ({
      ...current,
      sections: [...current.sections, { ...copy, sortOrder: current.sections.length }],
    }));
    setSelected(copy.id);
  }
  function remove(sectionId) {
    if (!window.confirm('Xóa section này khỏi bản nháp?')) return;
    change((current) => ({
      ...current,
      sections: current.sections
        .filter((section) => section.id !== sectionId)
        .map((section, index) => ({ ...section, sortOrder: index })),
    }));
    if (selected === sectionId) setSelected(null);
  }
  function reorder(from, to) {
    if (to < 0 || to >= page.sections.length) return;
    const sections = [...page.sections];
    sections.splice(to, 0, sections.splice(from, 1)[0]);
    change({ sections: sections.map((section, index) => ({ ...section, sortOrder: index })) });
  }
  async function save() {
    setBusy(true);
    setError('');
    setFields({});
    setNotice('');
    try {
      const keys = [
        'title',
        'slug',
        'navLabel',
        'showInNav',
        'navOrder',
        'seoTitle',
        'seoDescription',
        'ogImageId',
        'sections',
        'updatedAt',
      ];
      const body = Object.fromEntries(
        keys.filter((key) => page[key] !== undefined).map((key) => [key, page[key]]),
      );
      const saved = await api(`/api/v1/admin/pages/${id}`, { method: 'PATCH', body });
      setPage(saved);
      setDirty(false);
      setNotice('Đã lưu bản nháp. Nội dung công khai chưa thay đổi.');
      return saved;
    } catch (cause) {
      setFields(cause.fields || {});
      setError(
        [
          cause.message,
          ...Object.entries(cause.fields || {}).map(([key, value]) => `${key}: ${value}`),
        ].join(' · '),
      );
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!window.confirm('Xuất bản bản nháp hiện tại lên website công khai?')) return;
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    setError('');
    try {
      const published = await api(`/api/v1/admin/pages/${id}/publish`, {
        method: 'POST',
        body: { draftRevisionId: saved.draftRevisionId },
      });
      setPage(published);
      setNotice('Đã xuất bản. Website công khai đã cập nhật.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    if (
      !window.confirm(
        `Gỡ xuất bản “${page.title}”? Khách truy cập sẽ không xem được trang${page.type === 'HOME' ? ', bao gồm trang chủ' : ''}.`,
      )
    )
      return;
    if (dirty && !(await save())) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api(`/api/v1/admin/pages/${id}/unpublish`, { method: 'POST' });
      setPage(updated);
      setNotice('Đã gỡ xuất bản. Các bản sửa đổi vẫn được lưu.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  async function preview() {
    const tab = window.open('about:blank', '_blank');
    const saved = dirty ? await save() : page;
    if (saved) {
      if (tab) {
        tab.opener = null;
        tab.location.href = `/admin/preview/${id}`;
      } else router.push(`/admin/preview/${id}`);
    } else tab?.close();
  }
  return {
    page,
    selected,
    setSelected,
    loading,
    busy,
    error,
    fields,
    notice,
    dirty,
    change,
    updateSection,
    addSection,
    duplicate,
    remove,
    reorder,
    save,
    publish,
    unpublish,
    preview,
  };
}
