'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client-api';
import { useAdminResource } from './useAdminResource';
export function useContactInbox(initialStatus = '', initialLead = '') {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const resource = useAdminResource(
    `/api/v1/admin/contacts?search=${encodeURIComponent(search)}&status=${status}&page=${page}&pageSize=12`,
  );
  const reportError = resource.setError;
  useEffect(() => {
    if (!initialLead) return;
    let alive = true;
    api(`/api/v1/admin/contacts/${encodeURIComponent(initialLead)}`)
      .then((result) => {
        if (alive) setSelected(result);
      })
      .catch((cause) => {
        if (alive) reportError(cause.message);
      });
    return () => {
      alive = false;
    };
  }, [initialLead, reportError]);
  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await resource.mutate(
      `/api/v1/admin/contacts/${selected.id}`,
      {
        method: 'PATCH',
        body: { status: form.get('status'), internalNote: form.get('internalNote') },
      },
      'Đã cập nhật liên hệ.',
    );
    if (result) setSelected(result);
  }
  async function remove() {
    if (
      !window.confirm(
        `Xóa vĩnh viễn liên hệ của ${selected.name}? Thao tác này không thể hoàn tác.`,
      )
    )
      return;
    const result = await resource.mutate(
      `/api/v1/admin/contacts/${selected.id}`,
      { method: 'DELETE' },
      'Đã xóa dữ liệu liên hệ.',
    );
    if (result) setSelected(null);
  }
  return {
    ...resource,
    search,
    setSearch(value) {
      setSearch(value);
      setPage(1);
    },
    status,
    setStatus(value) {
      setStatus(value);
      setPage(1);
    },
    page,
    setPage,
    selected,
    setSelected,
    save,
    remove,
  };
}
