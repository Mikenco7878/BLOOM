import { readdir } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { checkDeploymentConfig } from '../src/lib/deployment-config.js';

const { errors, warnings } = checkDeploymentConfig(process.env);
const checkDatabase = process.argv.includes('--database');

if (checkDatabase && errors.length === 0) {
  const database = new PrismaClient();
  try {
    const migrations = await readdir(new URL('../prisma/migrations/', import.meta.url), {
      withFileTypes: true,
    });
    const applied = await database.$queryRaw`
      SELECT migration_name FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`;
    const appliedNames = new Set(applied.map((row) => row.migration_name));
    if (migrations.some((entry) => entry.isDirectory() && !appliedNames.has(entry.name)))
      errors.push('Database còn migration chưa áp dụng. Chạy npm run db:migrate.');
    const [admins, home, settings, localAssets, illustrations] = await Promise.all([
      database.adminUser.count({ where: { isActive: true, role: 'ADMIN' } }),
      database.page.findFirst({
        where: { type: 'HOME', status: 'PUBLISHED', deletedAt: null },
        select: { publishedRevisionId: true },
      }),
      database.siteSetting.findUnique({ where: { id: 'site' } }),
      database.mediaAsset.count({ where: { provider: { in: ['local', 'local-development'] } } }),
      database.mediaAsset.count({ where: { provider: 'seed', usages: { some: {} } } }),
    ]);
    if (!admins) errors.push('Chưa có ADMIN hoạt động. Chạy npm run admin:create.');
    if (!home?.publishedRevisionId) errors.push('Chưa có trang chủ đã xuất bản.');
    if (!settings) errors.push('Chưa có Site Settings. Chạy seed trên database mới.');
    if (localAssets)
      errors.push(
        `Có ${localAssets} ảnh local không đọc được ở production. Tải lên Cloudinary và thay tham chiếu trước khi chuyển dữ liệu.`,
      );
    if (illustrations)
      warnings.push('Nội dung còn dùng ảnh minh họa seed; kiểm duyệt và thay ảnh thật khi ra mắt.');
    if (settings && !settings.email && !settings.phone && !settings.facebookUrl)
      warnings.push('Chưa có email, điện thoại hoặc Facebook công khai trong Settings.');
    if (settings && !settings.defaultOgImageId)
      warnings.push('Chưa có ảnh chia sẻ mặc định (Open Graph) trong Settings.');
  } catch (error) {
    // Database errors can contain connection credentials; only print a safe code.
    errors.push(`Không thể xác minh database/migrations (${error.code || 'DATABASE_ERROR'}).`);
  } finally {
    await database.$disconnect();
  }
}

for (const message of errors) console.error(`ERROR: ${message}`);
for (const message of warnings) console.warn(`WARN: ${message}`);
if (errors.length) {
  console.error(`Chưa sẵn sàng deploy: ${errors.length} lỗi cấu hình.`);
  process.exitCode = 1;
} else {
  console.log(
    checkDatabase
      ? 'PASS: cấu hình và dữ liệu deploy đã được kiểm tra ở chế độ chỉ đọc.'
      : 'PASS: cấu hình deploy hợp lệ. Thêm --database để kiểm tra dữ liệu và migrations.',
  );
  console.log('Cần kiểm thử HTTPS, proxy và upload Cloudinary thật trên môi trường staging.');
}
