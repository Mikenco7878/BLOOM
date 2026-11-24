import SectionRenderer from '@/components/sections/SectionRenderer';
import { pageMetadata } from '@/components/site/page-metadata';
import { getPublicMedia } from '@/features/pages/page.service';
import { loadPublicPage } from '@/components/site/load-public-page';
import { getPublicSettings } from '@/features/settings/settings.service';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [page, settings, media] = await Promise.all([
    loadPublicPage(slug),
    getPublicSettings(),
    getPublicMedia(),
  ]);
  return pageMetadata(page, settings, media);
}

export default async function CmsPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const [page, media, settings] = await Promise.all([
    loadPublicPage(slug),
    getPublicMedia(),
    getPublicSettings(),
  ]);
  return (
    <SectionRenderer
      sections={page.sections}
      media={media}
      settings={settings}
      contactSuccess={slug === 'lien-he' && query?.sent === '1'}
    />
  );
}
