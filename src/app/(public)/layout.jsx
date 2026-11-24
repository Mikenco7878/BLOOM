import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { getPublicNavigation, getPublicMedia } from '@/features/pages/page.service';
import { getPublicSettings } from '@/features/settings/settings.service';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }) {
  const [navigation, settings, media] = await Promise.all([
    getPublicNavigation(),
    getPublicSettings(),
    getPublicMedia(),
  ]);
  return (
    <>
      <SiteHeader navigation={navigation} settings={settings} media={media} />
      <main id="main-content">{children}</main>
      <SiteFooter navigation={navigation} settings={settings} media={media} />
    </>
  );
}
