import { contactSchema, contactUpdateSchema } from './contact.schema.js';
import {
  countContacts,
  findContact,
  findContactList,
  insertContact,
  updateContact,
  removeContact,
} from './contact.repository.js';
import { rateLimit, requestAddress } from '../../lib/rate-limit.js';
import { cmsTransaction } from '../../lib/db.js';
import { HttpError, notFound } from '../../lib/errors.js';
import { audit } from '../audit/audit.service.js';

export async function submitContact(input, request) {
  await rateLimit('contact', requestAddress(request), 5, 600);
  const data = contactSchema.parse(input);
  if (data.website) throw new HttpError(422, 'SPAM_REJECTED', 'Không thể gửi yêu cầu này.');
  const { consent: _consent, website: _website, ...fields } = data;
  const lead = await insertContact({ ...fields, consentAt: new Date() });
  return { id: lead.id };
}

export async function listContacts({ q = '', status = '', page = 1, pageSize = 20 } = {}) {
  const where = {
    ...(q
      ? {
          OR: ['name', 'email', 'subject'].map((field) => ({
            [field]: { contains: q, mode: 'insensitive' },
          })),
        }
      : {}),
    ...(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'].includes(status) ? { status } : {}),
  };
  const [items, total] = await Promise.all([
    findContactList(where, (page - 1) * pageSize, pageSize),
    countContacts(where),
  ]);
  return { items, total, page, pageSize };
}

export async function getContact(id) {
  const lead = await findContact(id);
  if (!lead) notFound();
  return lead;
}
export async function editContact(id, input, actor) {
  const data = contactUpdateSchema.parse(input);
  return cmsTransaction(async (tx) => {
    if (!(await findContact(id, tx))) notFound();
    const lead = await updateContact(id, data, tx);
    await audit(
      actor.id,
      'CONTACT_STATUS_UPDATED',
      'ContactLead',
      id,
      `Cập nhật liên hệ: ${lead.status}`,
      tx,
    );
    return lead;
  });
}

export async function deleteContact(id, actor) {
  return cmsTransaction(async (tx) => {
    if (!(await findContact(id, tx))) notFound();
    await removeContact(id, tx);
    await audit(
      actor.id,
      'CONTACT_DELETED',
      'ContactLead',
      id,
      'Xóa yêu cầu liên hệ theo quy trình bảo vệ dữ liệu',
      tx,
    );
    return { id, deleted: true };
  });
}
