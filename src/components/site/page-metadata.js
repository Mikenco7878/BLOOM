export function pageMetadata(page, settings = {}, media = {}) {
  if (!page)
    return { title: 'Không tìm thấy trang | BLOOM', robots: { index: false, follow: false } };
  const title = page.seoTitle || `${page.title} | ${settings.siteName || 'BLOOM'}`;
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
      siteName: settings.siteName || 'BLOOM',
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
