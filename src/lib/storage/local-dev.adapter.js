import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import path from 'node:path';

function storageRoot() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Local development storage is disabled in production');
  return path.resolve(process.env.LOCAL_STORAGE_PATH || '.data/uploads');
}

function storagePath(key) {
  if (!/^[a-f0-9-]+(?:-thumb)?\.webp$/.test(key)) throw new Error('Invalid storage key');
  return path.join(storageRoot(), key);
}

export const localStorage = {
  async upload({ key, original, thumbnail }) {
    await mkdir(storageRoot(), { recursive: true });
    const thumbnailKey = `${key}-thumb.webp`;
    const originalKey = `${key}.webp`;
    try {
      await writeFile(storagePath(originalKey), original, { flag: 'wx' });
      await writeFile(storagePath(thumbnailKey), thumbnail, { flag: 'wx' });
    } catch (error) {
      await Promise.allSettled([
        unlink(storagePath(originalKey)),
        unlink(storagePath(thumbnailKey)),
      ]);
      throw error;
    }
    return {
      provider: 'local',
      providerKey: key,
      url: `/api/v1/uploads/${originalKey}`,
      thumbnailUrl: `/api/v1/uploads/${thumbnailKey}`,
    };
  },
  async remove(asset) {
    await Promise.all(
      [`${asset.providerKey}.webp`, `${asset.providerKey}-thumb.webp`].map(async (key) => {
        try {
          await unlink(storagePath(key));
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }),
    );
  },
  async read(key) {
    return readFile(storagePath(key));
  },
};
