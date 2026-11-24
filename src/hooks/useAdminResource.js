'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export function useAdminResource(path) {
  const requestVersion = useRef(0);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const result = await api(path);
      if (version === requestVersion.current) setData(result);
    } catch (cause) {
      if (version !== requestVersion.current) return;
      if (cause.status === 401) {
        router.push('/admin/login');
        router.refresh();
      } else setError(cause.message);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [path, router]);
  useEffect(() => {
    const handle = setTimeout(reload, 0);
    return () => {
      clearTimeout(handle);
      requestVersion.current += 1;
    };
  }, [reload]);
  async function mutate(url, options, message, refresh = true) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api(url, options);
      if (refresh) await reload();
      setNotice(message || 'Đã lưu thay đổi.');
      return result;
    } catch (cause) {
      if (cause.status === 401) {
        router.push('/admin/login');
        router.refresh();
      } else setError(cause.message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { data, loading, error, notice, busy, reload, mutate, setError, setNotice };
}
