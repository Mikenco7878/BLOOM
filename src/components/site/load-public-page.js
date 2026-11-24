import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicPage, getRedirect } from '@/features/pages/page.service';

// React cache is request-scoped. Metadata and HTML use the same published snapshot.
export const loadPublicPage = cache(async (slug = '') => {
  const page = await getPublicPage(slug);
  if (page) return page;
  const redirect = await getRedirect(slug ? `/${slug}` : '/');
  if (redirect) permanentRedirect(redirect.newPath);
  notFound();
});
