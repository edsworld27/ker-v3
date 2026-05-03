import React, { useState } from 'react';
import {
  Search, Mail, Phone, MapPin, Building2, Plus, Trash2, Users as UsersIcon,
} from 'lucide-react';
import {
  Page, PageHeader, Card, Button, Input, SearchInput, Field, Modal, Badge, EmptyState, Avatar, Textarea,
} from '@aqua/bridge/ui/kit';
import { useContactsLogic } from './logic/useContactsLogic';
import type { Contact } from './logic/mockData';

const formatCurrency = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${n.toLocaleString('en-US')}`;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface ContactPanelProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: (patch: { name?: string; title?: string; email?: string; phone?: string; notes?: string }) => void;
  onDelete: () => void;
}

const ContactPanel: React.FC<ContactPanelProps> = ({ contact, onClose, onUpdate, onDelete }) => (
  <Card padding="md" className="space-y-5 sticky top-4">
    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
      <Avatar name={contact.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-white truncate">{contact.name}</h3>
        <p className="text-xs text-slate-400 truncate">{contact.title}</p>
        <p className="text-xs text-slate-500 truncate">{contact.company}</p>
      </div>
    </div>

    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Contact</div>
      <div className="space-y-1.5">
        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">{contact.email}</span>
        </a>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          <span>{contact.phone}</span>
        </div>
        {contact.location && contact.location !== '—' && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{contact.location}</span>
          </div>
        )}
      </div>
    </div>

    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</div>
      <Textarea
        defaultValue={contact.notes}
        onBlur={e => onUpdate({ notes: e.target.value })}
        placeholder="Add notes..."
        rows={3}
      />
      <p className="text-[11px] text-slate-500 mt-1">Last contacted {formatDate(contact.lastContacted)}</p>
    </div>

    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>Recent deals</span>
        <Badge tone="indigo">{contact.recentDeals.length}</Badge>
      </div>
      {contact.recentDeals.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No deals on record yet.</p>
      ) : (
        <div className="space-y-1.5">
          {contact.recentDeals.map(deal => (
            <div key={deal.id} className="flex items-center justify-between gap-2 px-2.5 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{deal.name}</div>
                <div className="text-[11px] text-slate-500">{deal.stage}</div>
              </div>
              <div className="text-sm font-semibold text-white tabular-nums shrink-0">{formatCurrency(deal.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      <Button
        variant="danger"
        size="sm"
        icon={Trash2}
        onClick={() => {
          if (typeof window !== 'undefined' && window.confirm(`Remove ${contact.name}?`)) onDelete();
        }}
      >
        Remove
      </Button>
      <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
    </div>
  </Card>
);

export const ContactsView: React.FC = () => {
  const {
    contacts,
    searchQuery,
    setSearchQuery,
    selectedContact,
    selectContact,
    totalCount,
    visibleCount,
    createContact,
    updateContact,
    deleteContact,
  } = useContactsLogic();

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', title: '', email: '', phone: '', company: '' });
  const draftValid = draft.name.trim().length > 0 && draft.email.trim().length > 0;

  const submit = () => {
    if (!draftValid) return;
    createContact({
      name: draft.name.trim(),
      title: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      company: draft.company.trim(),
    });
    setDraft({ name: '', title: '', email: '', phone: '', company: '' });
    setCreateOpen(false);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Contacts"
        subtitle="Searchable directory of every contact tied to a deal."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search by name, company, title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
              New contact
            </Button>
          </>
        }
      />

      <p className="text-xs text-slate-500 mb-4">
        Showing {visibleCount} of {totalCount} contacts
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {contacts.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={UsersIcon}
                title="No contacts match"
                description={searchQuery ? `Nothing matches "${searchQuery}".` : 'Add your first contact to start building the directory.'}
                action={
                  searchQuery
                    ? <Button size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
                    : <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateOpen(true)}>New contact</Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contacts.map(contact => (
                <Card
                  key={contact.id}
                  padding="md"
                  onClick={() => selectContact(contact.id)}
                  className={selectedContact?.id === contact.id ? 'ring-1 ring-indigo-400/40 border-indigo-400/30' : ''}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={contact.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{contact.name}</div>
                      <div className="text-xs text-slate-400 truncate">{contact.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedContact ? (
            <ContactPanel
              contact={selectedContact}
              onClose={() => selectContact(null)}
              onUpdate={patch => updateContact(selectedContact.id, patch)}
              onDelete={() => deleteContact(selectedContact.id)}
            />
          ) : (
            <Card padding="lg">
              <EmptyState
                title="Select a contact"
                description="Click any card to view profile, edit notes, and see linked deals."
              />
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New contact"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submit}>Save contact</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <Input autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Avery Wong" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <Input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="VP Marketing" />
            </Field>
            <Field label="Company">
              <Input value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))} placeholder="Northwind Logistics" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required>
              <Input type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder="avery@example.com" />
            </Field>
            <Field label="Phone">
              <Input value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+1 555 0101" />
            </Field>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default ContactsView;
