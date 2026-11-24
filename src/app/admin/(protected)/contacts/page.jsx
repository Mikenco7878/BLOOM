import ContactInbox from '@/components/admin/ContactInbox';
export default async function ContactsPage({ searchParams }) {
  const query = await searchParams;
  return (
    <ContactInbox
      key={`${query.status || 'all'}-${query.lead || ''}`}
      initialStatus={
        ['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'].includes(query.status) ? query.status : ''
      }
      initialLead={typeof query.lead === 'string' ? query.lead : ''}
    />
  );
}
