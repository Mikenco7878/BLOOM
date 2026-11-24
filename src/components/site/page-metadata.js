export function pageMetadata(page, settings = {}, media = {}) {
  if (!page)
    return { title: 'Không tìm thấy trang | BLOOM', robots: { index: false, follow: false } };
  const siteName = settings.siteName || 'BLOOM';
  const defaultTitle = `${page.title} | ${siteName}`;
  const isHome = page.type === 'HOME' || page.slug === '';
  // Existing seed titles are already stored in published CMS snapshots.
  const title =
    isHome && (!page.seoTitle || page.seoTitle === defaultTitle)
      ? siteName
      : page.seoTitle || defaultTitle;
  const description = page.seoDescription || settings.tagline || '';
  const image = media[page.ogImageId || settings.defaultOgImageId];
  const url = page.slug ? `/${page.slug}` : '/';
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'vi_VN',
      type: 'website',
      ...(image
        ? {
            images: [
              { url: image.url, width: image.width, height: image.height, alt: image.altText },
            ],
          }
        : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
    ...(media[settings.faviconMediaId]?.url
      ? { icons: { icon: media[settings.faviconMediaId].url } }
      : {}),
  };
}
