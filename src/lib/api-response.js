import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './errors.js';
import { requireAdmin } from './session.js';
import { checkOrigin } from './csrf.js';

export function success(data, status = 200, message) {
  return NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function endpoint(handler, { admin = false, mutation = false } = {}) {
  return async (request, context) => {
    try {
      if (mutation) checkOrigin(request);
      const actor = admin ? await requireAdmin() : null;
      return await handler(request, context, actor);
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = Object.fromEntries(
          error.issues.map((issue) => [issue.path.join('.'), issue.message]),
        );
        return NextResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Vui lòng kiểm tra thông tin.', fields },
          },
          { status: 422 },
        );
      }
      if (error.code === 'P2002')
        return NextResponse.json(
          {
            success: false,
            error: { code: 'CONFLICT', message: 'Đường dẫn hoặc dữ liệu này đã tồn tại.' },
          },
          { status: 409 },
        );
      if (error instanceof HttpError)
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              ...(error.fields ? { fields: error.fields } : {}),
            },
          },
          { status: error.status },
        );
      // Never log request bodies, cookies, credentials or lead contents.
      console.error('API request failed:', error.name, error.code || 'INTERNAL_ERROR');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Hệ thống tạm thời không khả dụng. Vui lòng thử lại.',
          },
        },
        { status: 500 },
      );
    }
  };
}

export async function readJson(request, limit = 512 * 1024) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new HttpError(415, 'CONTENT_TYPE', 'Yêu cầu dữ liệu JSON.');
  const body = await readRequestBytes(request, limit);
  try {
    return JSON.parse(body.toString('utf8'));
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'JSON không hợp lệ.');
  }
}

export async function readOptionalJson(request, limit = 4096) {
  if (!request.body) return {};
  const body = await readRequestBytes(request, limit);
  if (!body.length) return {};
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new HttpError(415, 'CONTENT_TYPE', 'Yêu cầu dữ liệu JSON.');
  try {
    return JSON.parse(body.toString('utf8'));
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'JSON không hợp lệ.');
  }
}

async function readRequestBytes(request, limit) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'INVALID_JSON', 'Thiếu dữ liệu.');
  const chunks = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      throw new HttpError(413, 'BODY_TOO_LARGE', 'Dữ liệu vượt giới hạn cho phép.');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export function listParams(request) {
  const params = new URL(request.url).searchParams;
  return {
    q: (params.get('q') || params.get('search') || '').slice(0, 100),
    status: params.get('status') || '',
    page: Math.floor(Math.max(1, Math.min(Number(params.get('page')) || 1, 100000))),
    pageSize: Math.floor(Math.max(1, Math.min(Number(params.get('pageSize')) || 20, 100))),
  };
}

export async function readUploadForm(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;'))
    throw new HttpError(415, 'CONTENT_TYPE', 'Yêu cầu multipart/form-data.');
  const limit = 5 * 1024 * 1024 + 65536;
  const body = await readRequestBytes(request, limit);
  try {
    return await new Response(body, { headers: { 'content-type': contentType } }).formData();
  } catch {
    throw new HttpError(422, 'INVALID_UPLOAD', 'Dữ liệu ảnh không hợp lệ.');
  }
}

export async function readContactInput(request) {
  if (!request.headers.get('content-type')?.includes('application/x-www-form-urlencoded'))
    return { input: await readJson(request, 16384), nativeForm: false };
  const body = await readRequestBytes(request, 16384);
  const input = Object.fromEntries(new URLSearchParams(body.toString('utf8')));
  input.consent = input.consent === 'on';
  return { input, nativeForm: true };
}
