import { HttpError } from './errors.js';

export function checkOrigin(request) {
  const configured = new URL(process.env.SITE_URL || 'http://localhost:3000').origin;
  const origin = request.headers.get('origin');
  if (origin !== configured || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new HttpError(
      403,
      'CSRF_REJECTED',
      'Nguồn yêu cầu không hợp lệ. Vui lòng tải lại trang.',
    );
  }
}
