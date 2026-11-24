import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { readUploadForm } from '../../src/lib/api-response.js';
import { uploadMedia } from '../../src/features/media/media.service.js';

describe('Upload trust boundary', () => {
  it('rejects a truncated JPEG that passes header inspection before storage or DB writes', async () => {
    const jpeg = await sharp({
      create: { width: 400, height: 400, channels: 3, background: '#1f4d3a' },
    })
      .jpeg()
      .toBuffer();
    const truncated = jpeg.subarray(0, jpeg.length - 10);
    await expect(sharp(truncated).metadata()).resolves.toMatchObject({ format: 'jpeg' });
    const form = new FormData();
    form.set('file', new File([truncated], 'truncated.jpg', { type: 'image/jpeg' }));
    await expect(uploadMedia(form, { id: 'unused' })).rejects.toMatchObject({
      status: 422,
      code: 'INVALID_IMAGE',
    });
  });

  it.each([undefined, '1'])(
    'caps the actual stream even when Content-Length is %s',
    async (declaredLength) => {
      let cancelled = false;
      const stream = new ReadableStream({
        pull(controller) {
          controller.enqueue(new Uint8Array(512 * 1024));
        },
        cancel() {
          cancelled = true;
        },
      });
      const headers = { 'Content-Type': 'multipart/form-data; boundary=qa' };
      if (declaredLength) headers['Content-Length'] = declaredLength;
      const request = new Request('http://localhost/upload', {
        method: 'POST',
        headers,
        body: stream,
        duplex: 'half',
      });
      await expect(readUploadForm(request)).rejects.toMatchObject({
        status: 413,
        code: 'BODY_TOO_LARGE',
      });
      expect(cancelled).toBe(true);
    },
  );

  it('checks decoded magic bytes rather than trusting filename or supplied MIME', async () => {
    const form = new FormData();
    form.set(
      'file',
      new File(
        ['<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'],
        'photo.png',
        { type: 'image/png' },
      ),
    );
    await expect(uploadMedia(form, { id: 'unused' })).rejects.toMatchObject({
      status: 422,
      code: 'INVALID_IMAGE',
    });
    const png = await sharp({
      create: { width: 12, height: 12, channels: 3, background: '#1f4d3a' },
    })
      .png()
      .toBuffer();
    form.set('file', new File([png], 'photo.webp', { type: 'image/webp' }));
    await expect(uploadMedia(form, { id: 'unused' })).rejects.toMatchObject({
      status: 422,
      code: 'INVALID_IMAGE',
    });
  });

  it('rejects oversized files and excessive dimensions before storage or DB writes', async () => {
    const form = new FormData();
    form.set(
      'file',
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'photo.png', { type: 'image/png' }),
    );
    await expect(uploadMedia(form, { id: 'unused' })).rejects.toMatchObject({
      status: 422,
      code: 'FILE_SIZE',
    });
    const wide = await sharp({
      create: { width: 9000, height: 1, channels: 3, background: '#1f4d3a' },
    })
      .png()
      .toBuffer();
    form.set('file', new File([wide], 'wide.png', { type: 'image/png' }));
    await expect(uploadMedia(form, { id: 'unused' })).rejects.toMatchObject({
      status: 422,
      code: 'INVALID_IMAGE',
    });
  });
});
