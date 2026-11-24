export function mapDraft(page) {
  return {
    ...page.draftRevision?.contentJson,
    id: page.id,
    type: page.type,
    status: page.status,
    updatedAt: page.updatedAt.toISOString(),
    createdAt: page.createdAt.toISOString(),
    publishedAt: page.publishedAt?.toISOString() || null,
    draftRevisionId: page.draftRevisionId,
    publishedRevisionId: page.publishedRevisionId,
  };
}

export function mapPublished(page) {
  if (!page?.publishedRevision) return null;
  return {
    ...page.publishedRevision.contentJson,
    id: page.id,
    type: page.type,
    status: 'PUBLISHED',
    publishedAt: page.publishedAt?.toISOString() || null,
  };
}
