import { db } from '../../lib/db.js';

export const findSettings = (client = db) =>
  client.siteSetting.findUnique({ where: { id: 'site' } });
export const saveSettings = (data, client) =>
  client.siteSetting.upsert({
    where: { id: 'site' },
    create: { id: 'site', ...data },
    update: data,
  });
