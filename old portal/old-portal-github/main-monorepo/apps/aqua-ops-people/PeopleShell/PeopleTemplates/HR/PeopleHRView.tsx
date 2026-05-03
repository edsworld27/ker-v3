import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Star,
  ShieldCheck,
  Mail,
  Briefcase,
  Users as UsersIcon,
} from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  SearchInput,
  Field,
  Modal,
  Badge,
  Avatar,
  EmptyState,
  Toast,
} from '@aqua/bridge/ui/kit';
import { usePeopleHRLogic } from './logic/usePeopleHRLogic';
import { peopleStore, type Dept, type EmployeeStatus } from '../store/peopleStore';

const STATUSES: EmployeeStatus[] = ['On-site', 'Remote', 'Hybrid', 'On Leave'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract'] as const;

const statusTone = (s: EmployeeStatus) => {
  if (s === 'On-site') return 'success' as const;
  if (s === 'Remote') return 'info' as const;
  if (s === 'Hybrid') return 'indigo' as const;
  return 'warning' as const;
};

export const PeopleHRView: React.FC = () => {
  const {
    employees,
    departments,
    deptCounts,
    selectedDept,
    setSelectedDept,
    searchQuery,
    setSearchQuery,
    expiringClearances,
    profileOpen,
    setProfileOpen,
    postRoleOpen,
    setPostRoleOpen,
    auditToast,
    jobs,
    onPostRole,
    onViewProfile,
    onAuditNow,
  } = usePeopleHRLogic();

  const [draft, setDraft] = useState({
    title: '',
    dept: 'Engineering' as Dept,
    location: 'Remote',
    type: 'Full-time' as typeof JOB_TYPES[number],
    description: '',
  });
  const draftValid = draft.title.trim().length > 0;
  const submitDraft = () => {
    if (!draftValid) return;
    peopleStore.createJob({
      title: draft.title.trim(),
      dept: draft.dept,
      location: draft.location.trim() || 'Remote',
      type: draft.type,
      description: draft.description.trim() || undefined,
    });
    setDraft({ title: '', dept: 'Engineering', location: 'Remote', type: 'Full-time', description: '' });
    setPostRoleOpen(false);
  };

  const totalCount = Object.values(deptCounts).reduce((s, n) => s + n, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="People"
        title="People Hub"
        subtitle="Talent directory, open roles, and compliance — all in one place."
        actions={
          <>
            <SearchInput
              icon={Search}
              placeholder="Search talent..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={UserPlus} onClick={onPostRole}>
              Post role
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <Card padding="md">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Departments</div>
            <div className="space-y-1">
              <DeptButton active={selectedDept === null} count={totalCount} onClick={() => setSelectedDept(null)}>
                All
              </DeptButton>
              {departments.map(d => (
                <DeptButton
                  key={d}
                  active={selectedDept === d}
                  count={deptCounts[d] ?? 0}
                  onClick={() => setSelectedDept(selectedDept === d ? null : d)}
                >
                  {d}
                </DeptButton>
              ))}
            </div>
          </Card>

          <Card padding="md" className="bg-emerald-500/[0.04] border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider text-emerald-300/70 font-medium">Compliance</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {expiringClearances === 0
                ? 'All clearances current.'
                : `${expiringClearances} clearance${expiringClearances === 1 ? '' : 's'} expiring in the next 30 days.`}
            </p>
            <Button variant="secondary" size="sm" onClick={onAuditNow} className="w-full">
              Audit now
            </Button>
          </Card>

          {jobs.filter(j => j.status === 'open').length > 0 && (
            <Card padding="md">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Open roles</span>
                <Badge tone="indigo">{jobs.filter(j => j.status === 'open').length}</Badge>
              </div>
              <div className="space-y-2.5">
                {jobs.filter(j => j.status === 'open').slice(0, 4).map(j => (
                  <div key={j.id} className="flex items-center gap-2.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{j.title}</div>
                      <div className="text-[11px] text-slate-500">{j.dept} · {j.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>

        <div className="lg:col-span-3">
          {employees.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={UsersIcon}
                title="No employees match the filters"
                description={selectedDept || searchQuery ? 'Try clearing the active filter.' : 'Add your first team member to get started.'}
                action={selectedDept || searchQuery ? (
                  <Button size="sm" onClick={() => { setSelectedDept(null); setSearchQuery(''); }}>Clear filters</Button>
                ) : undefined}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(e => (
                <Card key={e.id} padding="md" interactive onClick={() => onViewProfile(e)}>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar name={e.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-white truncate">{e.name}</h3>
                        {e.topPerformer && <Badge tone="amber">★ Top</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{e.role}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{e.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                    <span className="text-slate-500 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{e.performance.toFixed(1)}</span>
                    </span>
                    {e.email && (
                      <a
                        href={`mailto:${e.email}`}
                        onClick={ev => ev.stopPropagation()}
                        className="ml-auto text-slate-500 hover:text-white inline-flex items-center gap-1"
                        title={`Email ${e.name}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {auditToast && <Toast message={auditToast} tone="success" />}

      {/* Profile modal */}
      <Modal
        open={!!profileOpen}
        onClose={() => setProfileOpen(null)}
        title={profileOpen?.name ?? ''}
        description={profileOpen ? `${profileOpen.role} · ${profileOpen.dept}` : undefined}
        footer={
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (profileOpen && typeof window !== 'undefined' && window.confirm(`Remove ${profileOpen.name}?`)) {
                  peopleStore.deleteEmployee(profileOpen.id);
                  setProfileOpen(null);
                }
              }}
              className="mr-auto"
            >
              Remove
            </Button>
            <Button variant="primary" onClick={() => setProfileOpen(null)}>Done</Button>
          </>
        }
      >
        {profileOpen && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <Avatar name={profileOpen.name} size="lg" />
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  value={profileOpen.name}
                  onChange={e => peopleStore.upsertEmployee({ ...profileOpen, name: e.target.value })}
                  className="text-sm font-semibold"
                />
                <Input
                  value={profileOpen.role}
                  onChange={e => peopleStore.upsertEmployee({ ...profileOpen, role: e.target.value })}
                  placeholder="Role"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department">
                <Select value={profileOpen.dept} onChange={e => peopleStore.upsertEmployee({ ...profileOpen, dept: e.target.value as Dept })}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={profileOpen.status} onChange={e => peopleStore.upsertEmployee({ ...profileOpen, status: e.target.value as EmployeeStatus })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Email">
              <Input value={profileOpen.email ?? ''} onChange={e => peopleStore.upsertEmployee({ ...profileOpen, email: e.target.value })} type="email" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Performance" help="0–5 scale">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={profileOpen.performance}
                  onChange={e => peopleStore.upsertEmployee({ ...profileOpen, performance: Number(e.target.value) })}
                />
              </Field>
              <Field label="Started">
                <Input type="date" value={profileOpen.startedOn ?? ''} onChange={e => peopleStore.upsertEmployee({ ...profileOpen, startedOn: e.target.value })} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      {/* Post role modal */}
      <Modal
        open={postRoleOpen}
        onClose={() => setPostRoleOpen(false)}
        title="Post a role"
        description="Adds a job posting to the open-roles list."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPostRoleOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!draftValid} onClick={submitDraft}>Post role</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <Input autoFocus value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Senior Backend Engineer" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Select value={draft.dept} onChange={e => setDraft(d => ({ ...d, dept: e.target.value as Dept }))}>
                {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as typeof JOB_TYPES[number] }))}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Location">
            <Input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} placeholder="Remote (US)" />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              placeholder="What you'll do, what we're looking for..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 resize-y leading-relaxed"
            />
          </Field>
        </div>
      </Modal>
    </Page>
  );
};

const DeptButton: React.FC<{ active: boolean; count: number; onClick: () => void; children: React.ReactNode }> = ({
  active, count, onClick, children,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-2.5 h-8 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-indigo-500/15 text-white border border-indigo-500/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    <span>{children}</span>
    <span className="text-[10px] tabular-nums text-slate-500">{count}</span>
  </button>
);

export default PeopleHRView;
