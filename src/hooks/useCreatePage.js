'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export function useCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function changeTitle(value) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const page = await api('/api/v1/admin/pages', {
        method: 'POST',
        body: {
          title,
          slug,
          type: 'STANDARD',
          seoTitle: title,
          seoDescription: form.get('description'),
          navLabel: title,
          showInNav: form.get('showInNav') === 'on',
          navOrder: 10,
          sections: [],
        },
      });
      router.push(`/admin/pages/${page.id}/edit`);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  return {
    title,
    slug,
    busy,
    error,
    changeTitle,
    changeSlug(value) {
      setSlugEdited(true);
      setSlug(value);
    },
    submit,
  };
}
