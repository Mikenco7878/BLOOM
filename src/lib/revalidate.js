import { revalidatePath } from 'next/cache';

export function refreshPublic() {
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}
