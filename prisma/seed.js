import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { seedPages, seedSettings, seedMedia } from '../src/content/seed-content.js';
import { pageContentSchema } from '../src/features/pages/page.schema.js';
import { collectMediaReferences } from '../src/features/media/media-references.service.js';

const prisma = new PrismaClient();

async function main() {
  for (const asset of seedMedia) {
    await prisma.mediaAsset.upsert({ where: { id: asset.id }, create: asset, update: {} });
  }
  await prisma.siteSetting.upsert({
    where: { id: 'site' },
    create: { id: 'site', ...seedSettings },
    update: {},
  });
  for (const source of seedPages) {
    const { type, status: _status, ...fields } = source;
    const content = pageContentSchema.parse(fields);
    if (await prisma.page.findUnique({ where: { slug: content.slug } })) continue;
    await prisma.$transaction(async (tx) => {
      const page = await tx.page.create({
        data: {
          title: content.title,
          slug: content.slug,
          type,
          homeKey: type === 'HOME' ? 'HOME' : null,
          status: 'PUBLISHED',
          publishedSlug: content.slug,
          revisionCounter: 1,
          publishedAt: new Date(),
        },
      });
      const revision = await tx.pageRevision.create({
        data: { pageId: page.id, revisionNumber: 1, contentJson: content, isPublished: true },
      });
      await tx.page.update({
        where: { id: page.id },
        data: { draftRevisionId: revision.id, publishedRevisionId: revision.id },
      });
      const references = collectMediaReferences(content);
      if (references.length)
        await tx.mediaUsage.createMany({
          data: references.map((reference) => ({
            ...reference,
            entityType: 'PageRevision',
            entityId: revision.id,
          })),
          skipDuplicates: true,
        });
    });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12)
      throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (!existing) {
      const passwordHash = await argon2.hash(process.env.ADMIN_PASSWORD, { type: argon2.argon2id });
      await prisma.adminUser.create({
        data: { email, passwordHash, name: process.env.ADMIN_NAME || 'BLOOM Admin' },
      });
      console.log('Created admin from environment. Credentials were not logged.');
    }
  }
  console.log('Seed complete. Existing CMS content has been preserved.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.name, error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
