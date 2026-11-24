import { cmsTransaction } from '../../lib/db.js';
import { refreshPublic } from '../../lib/revalidate.js';
import { audit } from '../audit/audit.service.js';
import { setMediaReferences } from '../media/media-references.service.js';
import { settingsSchema } from './settings.schema.js';
import { findSettings, saveSettings } from './settings.repository.js';

export const getSettings = () => findSettings();
export const getPublicSettings = () => findSettings();
export async function updateSettings(input, actor) {
  const data = settingsSchema.parse(input);
  const result = await cmsTransaction(async (tx) => {
    const previous = await findSettings(tx);
    const merged = { ...previous, ...data };
    await setMediaReferences('SiteSetting', 'site', merged, tx);
    const settings = await saveSettings(data, tx);
    await audit(
      actor.id,
      'SETTINGS_UPDATED',
      'SiteSetting',
      'site',
      'Cập nhật cấu hình website',
      tx,
    );
    return settings;
  });
  refreshPublic();
  return result;
}
