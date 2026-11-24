import { localStorage } from './local-dev.adapter.js';
import { cloudinaryStorage } from './cloudinary.adapter.js';

export function getStorage(provider = process.env.STORAGE_PROVIDER || 'local') {
  if (provider === 'local' || provider === 'local-development') return localStorage;
  if (provider === 'cloudinary') return cloudinaryStorage;
  if (provider === 'seed') return { async remove() {} };
  throw new Error('Unsupported image storage provider');
}
