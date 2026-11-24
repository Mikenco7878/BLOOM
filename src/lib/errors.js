export class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function notFound(message = 'Không tìm thấy dữ liệu.') {
  throw new HttpError(404, 'NOT_FOUND', message);
}
