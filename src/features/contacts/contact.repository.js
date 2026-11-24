import { db } from '../../lib/db.js';

export const insertContact = (data) => db.contactLead.create({ data });
export const findContact = (id, client = db) => client.contactLead.findUnique({ where: { id } });
export const findContactList = (where, skip, take) =>
  db.contactLead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
export const countContacts = (where) => db.contactLead.count({ where });
export const updateContact = (id, data, client) =>
  client.contactLead.update({ where: { id }, data });
export const removeContact = (id, client) => client.contactLead.delete({ where: { id } });
