import SectionRenderer from '@/components/sections/SectionRenderer';
import { pageMetadata } from '@/components/site/page-metadata';
import { getPublicMedia } from '@/features/pages/page.service';
import { loadPublicPage } from '@/components/site/load-public-page';
import { getPublicSettings } from '@/features/settings/settings.service';

export async function generateMetadata() {
  const [page, settings, media] = await Promise.all([
    loadPublicPage(''),
    getPublicSettings(),
    getPublicMedia(),
  ]);
  return pageMetadata(page, settings, media);
}

export default async function HomePage() {
  const [page, media, settings] = await Promise.all([
    loadPublicPage(''),
    getPublicMedia(),
    getPublicSettings(),
  ]);
  return <SectionRenderer sections={page.sections} media={media} settings={settings} />;
}
