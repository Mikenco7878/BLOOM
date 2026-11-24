export const dynamic = 'force-dynamic';

export default function robots() {
  const url = new URL(process.env.SITE_URL || 'http://localhost:3000').origin;
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${url}/sitemap.xml`,
  };
}
