import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { cmsTransaction } from '../../lib/db.js';
import { HttpError, notFound } from '../../lib/errors.js';
import { refreshPublic } from '../../lib/revalidate.js';
import { getStorage } from '../../lib/storage/storage.interface.js';
import { audit } from '../audit/audit.service.js';
import { mediaMetadataSchema } from './media.schema.js';
import {
  allMedia,
  publishedMedia,
  countMedia,
  findMedia,
  findMediaList,
  insertMedia,
  updateMedia,
  removeMedia,
} from './media.repository.js';

export async function getPublicMedia() {
  return Object.fromEntries((await publishedMedia()).map((asset) => [asset.id, asset]));
}
export async function getAdminMediaMap() {
  return Object.fromEntries((await allMedia()).map((asset) => [asset.id, asset]));
}

export async function listMedia({ q = '', page = 1, pageSize = 20 } = {}) {
  const where = q
    ? {
        OR: [
          { filename: { contains: q, mode: 'insensitive' } },
          { altText: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    findMediaList(where, (page - 1) * pageSize, pageSize),
    countMedia(where),
  ]);
  return { items, total, page, pageSize };
}

async function optimizeImage(buffer) {
  try {
    const { data: original, info } = await sharp(buffer, { limitInputPixels: 40000000 })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer({ resolveWithObject: true });
    const thumbnail = await sharp(original)
      .resize({ width: 420, height: 320, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    return { original, info, thumbnail };
  } catch {
    throw new HttpError(
      422,
      'INVALID_IMAGE',
      'Dữ liệu hình ảnh bị hỏng hoặc không thể xử lý. Vui lòng chọn ảnh khác.',
    );
  }
}

export async function uploadMedia(form, actor) {
  const file = form.get('file');
  const metadata = mediaMetadataSchema.parse({
    altText: form.get('altText') || '',
    caption: form.get('caption') || '',
  });
  if (!file || typeof file.arrayBuffer !== 'function')
    throw new HttpError(422, 'FILE_REQUIRED', 'Vui lòng chọn hình ảnh.');
  if (file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new HttpError(422, 'FILE_SIZE', 'Ảnh phải nhỏ hơn hoặc bằng 5 MB.');
  const buffer = Buffer.from(await file.arrayBuffer());
  let metadataImage;
  try {
    metadataImage = await sharp(buffer, { limitInputPixels: 40000000, animated: false }).metadata();
  } catch {
    throw new HttpError(
      422,
      'INVALID_IMAGE',
      'Không thể đọc hình ảnh. Chỉ chấp nhận JPG, PNG, WebP.',
    );
  }
  const mime = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[metadataImage.format];
  if (
    !mime ||
    file.type !== mime ||
    metadataImage.pages > 1 ||
    !metadataImage.width ||
    !metadataImage.height ||
    metadataImage.width > 8192 ||
    metadataImage.height > 8192
  )
    throw new HttpError(
      422,
      'INVALID_IMAGE',
      'Ảnh phải là JPG, PNG hoặc WebP tĩnh, kích thước tối đa 8192 × 8192.',
    );
  const { original, info, thumbnail } = await optimizeImage(buffer);
  const storage = getStorage();
  const stored = await storage.upload({ key: randomUUID(), original, thumbnail });
  try {
    return await cmsTransaction(async (tx) => {
      const asset = await insertMedia(
        {
          ...stored,
          width: info.width,
          height: info.height,
          bytes: original.length,
          mimeType: 'image/webp',
          filename: file.name.replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 200),
          ...metadata,
        },
        tx,
      );
      await audit(
        actor.id,
        'MEDIA_UPLOADED',
        'MediaAsset',
        asset.id,
        `Tải ảnh: ${asset.filename}`,
        tx,
      );
      return asset;
    });
  } catch (error) {
    await storage
      .remove(stored)
      .catch(() => console.error('Storage cleanup requires reconciliation'));
    throw error;
  }
}

export async function editMedia(id, input, actor) {
  const data = mediaMetadataSchema.parse(input);
  const result = await cmsTransaction(async (tx) => {
    if (!(await findMedia(id, tx))) notFound();
    const asset = await updateMedia(id, data, tx);
    await audit(actor.id, 'MEDIA_UPDATED', 'MediaAsset', id, `Cập nhật ảnh: ${asset.filename}`, tx);
    return asset;
  });
  refreshPublic();
  return result;
}

export async function deleteMedia(id, actor) {
  const asset = await cmsTransaction(async (tx) => {
    const media = await findMedia(id, tx);
    if (!media) notFound();
    if (media.usages.length)
      throw new HttpError(
        409,
        'MEDIA_IN_USE',
        'Ảnh đang được sử dụng trong nội dung hoặc lịch sử phiên bản. Vui lòng thay tham chiếu trước khi xóa.',
      );
    await removeMedia(id, tx);
    await audit(actor.id, 'MEDIA_REMOVED', 'MediaAsset', id, `Xóa ảnh: ${media.filename}`, tx);
    return media;
  });
  await getStorage(asset.provider)
    .remove(asset)
    .catch(() => console.error('Orphaned storage object requires reconciliation:', asset.id));
  return { id, deleted: true };
}
