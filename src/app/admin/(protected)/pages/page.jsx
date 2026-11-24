import PageManager from '@/components/admin/PageManager';
export default async function PagesPage({ searchParams }) {
  const query = await searchParams;
  return (
    <PageManager
      key={query.status || 'all'}
      initialStatus={
        ['PUBLISHED', 'DRAFT', 'UNPUBLISHED'].includes(query.status) ? query.status : ''
      }
    />
  );
}
