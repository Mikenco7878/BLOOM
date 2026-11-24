import { findMediaByIds, insertUsages, removeUsages } from './media.repository.js';
import { HttpError } from '../../lib/errors.js';

// Data is schema-validated before recursion. Every retained revision owns references.
export function collectMediaReferences(value, path = '') {
  if (!value || typeof value !== 'object') return [];
  const references = [];
  for (const [key, entry] of Object.entries(value)) {
    const fieldKey = path ? `${path}.${key}` : key;
    if (
      [
        'imageId',
        'avatarId',
        'ogImageId',
        'logoMediaId',
        'faviconMediaId',
        'defaultOgImageId',
      ].includes(key) &&
      entry
    )
      references.push({ mediaId: entry, fieldKey });
    else if (key === 'imageIds' && Array.isArray(entry))
      entry.forEach((mediaId, index) =>
        references.push({ mediaId, fieldKey: `${fieldKey}.${index}` }),
      );
    else if (entry && typeof entry === 'object')
      references.push(...collectMediaReferences(entry, fieldKey));
  }
  return references;
}

export async function setMediaReferences(entityType, entityId, value, client) {
  const references = collectMediaReferences(value);
  const ids = [...new Set(references.map((item) => item.mediaId))];
  const assets = ids.length ? await findMediaByIds(ids, client) : [];
  if (assets.length !== ids.length)
    throw new HttpError(
      422,
      'INVALID_MEDIA',
      'Một số hình ảnh không còn tồn tại. Vui lòng chọn lại.',
    );
  await removeUsages(entityType, [entityId], client);
  if (references.length)
    await insertUsages(
      references.map((reference) => ({ ...reference, entityType, entityId })),
      client,
    );
}
