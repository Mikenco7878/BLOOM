export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, options = {}) {
  const form = options.body instanceof FormData;
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body && !form ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body && !form ? JSON.stringify(options.body) : options.body,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.error?.message || 'Không thể kết nối. Vui lòng thử lại.',
      response.status,
      payload?.error?.fields,
    );
  }
  return payload.data;
}
