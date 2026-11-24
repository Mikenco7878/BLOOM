'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client-api';
const editable = [
  'siteName',
  'tagline',
  'email',
  'phone',
  'facebookUrl',
  'footerText',
  'logoMediaId',
  'faviconMediaId',
  'defaultOgImageId',
];
export function useSiteSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    let alive = true;
    api('/api/v1/admin/settings')
      .then((result) => {
        if (alive) setSettings(result);
      })
      .catch((cause) => {
        if (alive) setError(cause.message);
      });
    return () => {
      alive = false;
    };
  }, []);
  function change(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setNotice('');
  }
  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const body = Object.fromEntries(
        editable.filter((key) => settings[key] !== undefined).map((key) => [key, settings[key]]),
      );
      setSettings(await api('/api/v1/admin/settings', { method: 'PATCH', body }));
      setNotice('Đã lưu cài đặt và cập nhật website công khai.');
      setDirty(false);
    } catch (cause) {
      setError(
        [
          cause.message,
          ...Object.entries(cause.fields || {}).map(([key, value]) => `${key}: ${value}`),
        ].join(' · '),
      );
    } finally {
      setBusy(false);
    }
  }
  return { settings, error, notice, busy, dirty, change, save };
}
