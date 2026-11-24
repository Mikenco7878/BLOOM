import { getPublicSitemap } from '@/features/pages/page.service';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const pages = await getPublicSitemap();
  const base = new URL(process.env.SITE_URL || 'http://localhost:3000').origin;
  return pages.map((page) => ({
    url: `${base}${page.slug ? `/${page.slug}` : '/'}`,
    lastModified: page.publishedAt || page.updatedAt,
    changeFrequency: 'weekly',
    priority: page.slug ? 0.7 : 1,
  }));
}
