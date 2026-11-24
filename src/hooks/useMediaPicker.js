'use client';
import { useState } from 'react';
import { useAdminResource } from './useAdminResource';
export function useMediaPicker() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const resource = useAdminResource(
    `/api/v1/admin/media?search=${encodeURIComponent(search)}&page=${page}&pageSize=12`,
  );
  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    const asset = await resource.mutate(
      '/api/v1/admin/media',
      { method: 'POST', body },
      'Ảnh đã được lưu vào thư viện.',
    );
    if (asset) form.reset();
    return asset;
  }
  return {
    ...resource,
    search,
    page,
    setSearch(value) {
      setSearch(value);
      setPage(1);
    },
    setPage,
    upload,
  };
}
