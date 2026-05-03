import { useCallback, useMemo, useState } from 'react';
import { crmStore, useCRMStore, type CRMContact } from '../../store/crmStore';
import type { Contact, ContactDeal } from './mockData';

const COLORS = [
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-sky-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-fuchsia-500 to-pink-600',
  'from-violet-500 to-indigo-600',
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

export interface UseContactsLogicResult {
  contacts: Contact[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedContact: Contact | null;
  selectContact: (id: string | null) => void;
  totalCount: number;
  visibleCount: number;
  // CRUD
  createContact: (input: Omit<CRMContact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, patch: Partial<CRMContact>) => void;
  deleteContact: (id: string) => void;
}

export const useContactsLogic = (): UseContactsLogicResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const contacts = useCRMStore<Contact[]>(s => {
    return s.contacts.map(c => {
      const linkedDeals = s.deals.filter(d => d.contactId === c.id);
      const lastActivity = s.activities
        .filter(a => a.contactId === c.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
      const recentDeals: ContactDeal[] = linkedDeals.slice(0, 5).map(d => ({
        id: d.id,
        name: d.name,
        value: d.value,
        stage: d.stage,
      }));
      return {
        id: c.id,
        name: c.name,
        title: c.title,
        company: c.company,
        email: c.email,
        phone: c.phone,
        location: '—',
        notes: c.notes ?? '',
        initials: initialsFor(c.name),
        avatarColor: colorFor(c.id),
        tags: [],
        recentDeals,
        lastContacted: lastActivity?.timestamp.slice(0, 10) ?? c.createdAt.slice(0, 10),
      };
    });
  });

  const filtered = useMemo<Contact[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [contacts, searchQuery]);

  const selectContact = useCallback((id: string | null) => setSelectedId(id), []);

  const selectedContact = useMemo(
    () => contacts.find(c => c.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  const createContact: UseContactsLogicResult['createContact'] = useCallback((input) => {
    const created = crmStore.createContact(input);
    crmStore.createActivity({
      type: 'note',
      actor: 'Contacts',
      summary: `Added contact ${created.name}${created.company ? ` from ${created.company}` : ''}`,
      contactId: created.id,
    });
  }, []);

  const updateContact: UseContactsLogicResult['updateContact'] = useCallback((id, patch) => {
    crmStore.updateContact(id, patch);
  }, []);

  const deleteContact: UseContactsLogicResult['deleteContact'] = useCallback((id) => {
    crmStore.deleteContact(id);
    setSelectedId(prev => (prev === id ? null : prev));
  }, []);

  return {
    contacts: filtered,
    searchQuery,
    setSearchQuery,
    selectedContact,
    selectContact,
    totalCount: contacts.length,
    visibleCount: filtered.length,
    createContact,
    updateContact,
    deleteContact,
  };
};
