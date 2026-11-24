const isPlaceholder = (value) =>
  !value || /change[_-]?me|replace[_-]?with|example\.(com|org|net)|your[_-]/i.test(value);

export function checkDeploymentConfig(env) {
  const errors = [];
  const warnings = [];
  try {
    const site = new URL(env.SITE_URL);
    if (
      site.protocol !== 'https:' ||
      ['localhost', '127.0.0.1', '[::1]'].includes(site.hostname) ||
      site.username ||
      site.password ||
      site.pathname !== '/' ||
      site.search ||
      site.hash ||
      isPlaceholder(site.hostname)
    )
      errors.push('SITE_URL phải là domain HTTPS thật, không có path, query hoặc credentials.');
  } catch {
    errors.push('SITE_URL chưa được cấu hình hợp lệ.');
  }
  try {
    const database = new URL(env.DATABASE_URL);
    if (
      !['postgres:', 'postgresql:'].includes(database.protocol) ||
      !database.hostname ||
      database.pathname.length < 2 ||
      isPlaceholder(env.DATABASE_URL)
    )
      errors.push('DATABASE_URL phải trỏ tới PostgreSQL thật, không dùng giá trị mẫu.');
    if (['localhost', '127.0.0.1', '[::1]'].includes(database.hostname))
      warnings.push(
        'DATABASE_URL trỏ tới localhost; kiểm tra database có tồn tại trên host deploy.',
      );
  } catch {
    errors.push('DATABASE_URL chưa được cấu hình hợp lệ.');
  }
  if (isPlaceholder(env.SESSION_SECRET) || env.SESSION_SECRET.length < 32)
    errors.push('SESSION_SECRET cần ít nhất 32 ký tự ngẫu nhiên; nên tạo 32 bytes dạng hex.');
  if (env.STORAGE_PROVIDER !== 'cloudinary')
    errors.push('Production cần STORAGE_PROVIDER=cloudinary; local upload bị tắt ở production.');
  for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (isPlaceholder(env[key])) errors.push(`${key} chưa được cấu hình bằng giá trị thật.`);
  }
  if (!['true', 'false'].includes(env.TRUST_PROXY))
    errors.push('Cấu hình TRUST_PROXY rõ ràng là true hoặc false.');
  if (env.TRUST_PROXY !== 'true')
    warnings.push(
      'Các khách đang dùng chung rate limit (5 liên hệ/10 phút). Xác minh proxy ghi đè X-Forwarded-For rồi đặt TRUST_PROXY=true trước public launch.',
    );
  if (env.ADMIN_PASSWORD)
    errors.push('Xóa ADMIN_PASSWORD khỏi environment deploy sau khi tạo tài khoản quản trị.');
  return { errors, warnings };
}
