/**
 * @aqua/bridge/ui/AppSettings — kit-styled settings surfaces shared by every sub-app.
 *
 * Each sub-app's `*SettingsPlaceholder.tsx` was a 474-line near-duplicate of
 * the same six views, only differing in CSS-var name. Lifted the implementation
 * here so the visual design lives in one place. Each per-app file re-exports
 * the named views below.
 *
 * Six exported views:
 *   - AgencyConfiguratorView (theme/branding)
 *   - GlobalSettingsView (notifications, security, data)
 *   - IntegrationsView (third-party connections)
 *   - AgencyBuilderView (white-label + custom domain)
 *   - AllUsersView (member directory + invite + edit drawer)
 *   - DashboardView (settings landing)
 *
 * Implementations are local-state-only — no persistence wiring. Templates
 * can override any view via the per-app Registration.register(id, Component)
 * helper.
 */
'use client';

import React, { useState, type ReactNode } from 'react';
import {
  Page,
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Field,
  SearchInput,
  Modal,
  Badge,
  Avatar,
} from './kit';

// ── Inline icons (no lucide dep in Bridge) ────────────────────────────────

const SvgBase: React.FC<{ className?: string; children: ReactNode }> = ({
  className = 'w-4 h-4',
  children,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

const PaletteIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </SvgBase>
);
const SettingsIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </SvgBase>
);
const GlobeIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </SvgBase>
);
const LayersIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </SvgBase>
);
const Users2Icon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M14 19a6 6 0 0 0-12 0" />
    <circle cx="8" cy="9" r="4" />
    <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
  </SvgBase>
);
const ZapIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </SvgBase>
);
const ShieldIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </SvgBase>
);
const BellIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </SvgBase>
);
const MailIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </SvgBase>
);
const SearchIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgBase>
);
const PlusIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </SvgBase>
);
const CheckIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M20 6 9 17l-5-5" />
  </SvgBase>
);
const XIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgBase>
);
const SlackIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <rect width="3" height="8" x="13" y="2" rx="1.5" />
    <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
    <rect width="3" height="8" x="8" y="14" rx="1.5" />
    <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
    <rect width="8" height="3" x="14" y="13" rx="1.5" />
    <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
    <rect width="8" height="3" x="2" y="8" rx="1.5" />
    <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
  </SvgBase>
);
const GitBranchIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <line x1="6" x2="6" y1="3" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </SvgBase>
);
const CreditCardIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </SvgBase>
);
const CalendarIcon: React.FC<{ className?: string }> = p => (
  <SvgBase {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </SvgBase>
);

// ── Toggle (kit doesn't ship one yet) ─────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: (next: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
      checked ? 'bg-indigo-500' : 'bg-white/10'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ── Local helpers ─────────────────────────────────────────────────────────

const FieldRow: React.FC<{ label: string; description?: string; children: ReactNode }> = ({
  label,
  description,
  children,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex-1 min-w-0 pr-4">
      <div className="text-sm font-medium text-white">{label}</div>
      {description ? <div className="text-xs text-slate-400 mt-0.5">{description}</div> : null}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

interface SectionCardProps {
  title?: string;
  children: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <Card padding="md">
    {title ? (
      <h3 className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.18em] mb-3">{title}</h3>
    ) : null}
    {children}
  </Card>
);

// ── 1. Agency Configurator ────────────────────────────────────────────────

export function AgencyConfiguratorView() {
  const [agencyName, setAgencyName] = useState('Aqua Demo Agency');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [logoUrl, setLogoUrl] = useState('https://aqua-digital.io/logo.png');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'aqua:agency-config',
          JSON.stringify({ agencyName, primaryColor, secondaryColor, logoUrl }),
        );
      }
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[AgencyConfig] save failed', err);
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Agency identity"
        subtitle="Customise branding, colours, and visual tokens used across every client portal."
      />

      <div className="space-y-3 max-w-3xl">
        <SectionCard title="Identity">
          <FieldRow label="Agency name" description="Shown in titles, emails, and client-portal headers.">
            <Input value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-64" />
          </FieldRow>
          <FieldRow label="Logo URL" description="Square SVG or PNG, ≥ 256 × 256.">
            <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-64" />
          </FieldRow>
        </SectionCard>

        <SectionCard title="Theme">
          <FieldRow label="Primary colour" description="Used for buttons, active states, and highlights.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-9 h-9 rounded-md border border-white/10 bg-transparent cursor-pointer"
              />
              <code className="text-xs text-slate-400 font-mono">{primaryColor}</code>
            </div>
          </FieldRow>
          <FieldRow label="Secondary colour" description="Accent for badges, progress bars, and secondary CTAs.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-9 h-9 rounded-md border border-white/10 bg-transparent cursor-pointer"
              />
              <code className="text-xs text-slate-400 font-mono">{secondaryColor}</code>
            </div>
          </FieldRow>
        </SectionCard>

        <div className="flex justify-end gap-3 items-center pt-2">
          {savedAt ? <span className="text-xs text-emerald-400">Saved {savedAt}</span> : null}
          <Button variant="primary" onClick={save}>Save changes</Button>
        </div>
      </div>
    </Page>
  );
}

// ── 2. Global Settings ────────────────────────────────────────────────────

export function GlobalSettingsView() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [auditLog, setAuditLog] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Global preferences"
        subtitle="Account-wide preferences for notifications, security, and data handling."
      />

      <div className="space-y-3 max-w-3xl">
        <SectionCard title="Notifications">
          <FieldRow
            label="Daily email digest"
            description="Summary of activity sent at 9 am every weekday."
          >
            <Toggle checked={emailDigest} onChange={setEmailDigest} />
          </FieldRow>
          <FieldRow
            label="Browser notifications"
            description="Push alerts for high-priority events while the portal is open."
          >
            <Toggle checked={browserNotifications} onChange={setBrowserNotifications} />
          </FieldRow>
        </SectionCard>

        <SectionCard title="Security">
          <FieldRow label="Audit log" description="Record every administrative action for compliance review.">
            <Toggle checked={auditLog} onChange={setAuditLog} />
          </FieldRow>
          <FieldRow
            label="Require 2-factor for staff"
            description="Force agency-side users to set up TOTP at next login."
          >
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </FieldRow>
        </SectionCard>

        <SectionCard title="Data">
          <FieldRow label="Automatic daily backup" description="Snapshot the agency database every night to S3.">
            <Toggle checked={autoBackup} onChange={setAutoBackup} />
          </FieldRow>
        </SectionCard>
      </div>
    </Page>
  );
}

// ── 3. Integrations ───────────────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'slack',  name: 'Slack',           description: 'Post notifications + receive commands in channels.', icon: SlackIcon,        connected: true  },
  { id: 'github', name: 'GitHub',          description: 'Sync deploys, issues, and PR review state.',         icon: GitBranchIcon,    connected: true  },
  { id: 'stripe', name: 'Stripe',          description: 'Pull invoices, subscriptions, and payment events.',  icon: CreditCardIcon,   connected: false },
  { id: 'gcal',   name: 'Google Calendar', description: 'Two-way sync for meetings and deal close dates.',    icon: CalendarIcon,     connected: false },
  { id: 'gmail',  name: 'Gmail',           description: 'Capture sent / received email as activity entries.', icon: MailIcon,         connected: false },
];

export function IntegrationsView() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const toggleIntegration = (id: string) =>
    setIntegrations(list => list.map(i => (i.id === id ? { ...i, connected: !i.connected } : i)));

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Integrations"
        subtitle="Connect third-party services to extend the platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
        {integrations.map(integration => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} padding="md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                    {integration.connected ? <Badge tone="success">Connected</Badge> : null}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{integration.description}</p>
                  <div className="mt-3">
                    {integration.connected ? (
                      <Button variant="outline" size="sm" onClick={() => toggleIntegration(integration.id)}>
                        Disconnect
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => toggleIntegration(integration.id)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

// ── 4. Agency Builder ─────────────────────────────────────────────────────

export function AgencyBuilderView() {
  const [whiteLabel, setWhiteLabel] = useState(true);
  const [customDomain, setCustomDomain] = useState('portal.aqua-digital.io');
  const [hideFooter, setHideFooter] = useState(false);

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Portal builder"
        subtitle="Customise layout, white-labelling, and presentation for client-facing surfaces."
      />

      <div className="space-y-3 max-w-3xl">
        <SectionCard title="White-label">
          <FieldRow
            label="Hide AQUA branding"
            description="Remove the 'powered by AQUA' footer everywhere clients see."
          >
            <Toggle checked={whiteLabel} onChange={setWhiteLabel} />
          </FieldRow>
          <FieldRow label="Custom domain" description="Where the client portal is served from.">
            <Input value={customDomain} onChange={e => setCustomDomain(e.target.value)} className="w-72" />
          </FieldRow>
          <FieldRow label="Hide global footer" description="Strip the static footer from every portal page.">
            <Toggle checked={hideFooter} onChange={setHideFooter} />
          </FieldRow>
        </SectionCard>
      </div>
    </Page>
  );
}

// ── 5. All Users ──────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'Founder' | 'AgencyManager' | 'AgencyEmployee' | 'ClientOwner' | 'Freelancer';
  status: 'active' | 'invited' | 'inactive';
}

const ROLES: UserRow['role'][] = ['Founder', 'AgencyManager', 'AgencyEmployee', 'ClientOwner', 'Freelancer'];

const ROLE_TONE: Record<UserRow['role'], 'amber' | 'indigo' | 'info' | 'success' | 'neutral'> = {
  Founder: 'amber',
  AgencyManager: 'indigo',
  AgencyEmployee: 'info',
  ClientOwner: 'success',
  Freelancer: 'neutral',
};

const STATUS_TONE: Record<UserRow['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  invited: 'warning',
  inactive: 'neutral',
};

const INITIAL_USERS: UserRow[] = [
  { id: 'u1', name: 'Ed Founder',      email: 'ed@aqua-digital.io',  role: 'Founder',        status: 'active'  },
  { id: 'u2', name: 'Jordan Manager',  email: 'jordan@aqua.io',      role: 'AgencyManager',  status: 'active'  },
  { id: 'u3', name: 'Sam Designer',    email: 'sam@aqua.io',         role: 'AgencyEmployee', status: 'active'  },
  { id: 'u4', name: 'Taylor Dev',      email: 'taylor@aqua.io',      role: 'AgencyEmployee', status: 'active'  },
  { id: 'u5', name: 'Casey Client',    email: 'casey@bigcorp.com',   role: 'ClientOwner',    status: 'active'  },
  { id: 'u6', name: 'Riley Freelance', email: 'riley@external.dev',  role: 'Freelancer',     status: 'invited' },
];

export function AllUsersView() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRow['role']>('AgencyEmployee');
  const [editing, setEditing] = useState<UserRow | null>(null);

  const filtered = users.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInvite = () => {
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    const namePart = trimmed.split('@')[0] || 'New Member';
    setUsers(prev => [
      ...prev,
      {
        id: `u${Date.now()}`,
        name: namePart.replace(/\b\w/g, c => c.toUpperCase()),
        email: trimmed,
        role: inviteRole,
        status: 'invited',
      },
    ]);
    setInviteEmail('');
    setInviteOpen(false);
  };

  const updateUser = (patch: Partial<UserRow>) => {
    if (!editing) return;
    setUsers(prev => prev.map(u => (u.id === editing.id ? { ...u, ...patch } : u)));
    setEditing(prev => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Team & access"
        subtitle="Manage members, roles, and seat allocation for the agency."
        actions={
          <>
            <SearchInput
              icon={SearchIcon}
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-72 hidden md:block"
            />
            <Button variant="primary" icon={PlusIcon} onClick={() => setInviteOpen(o => !o)}>
              Invite member
            </Button>
          </>
        }
      />

      {inviteOpen ? (
        <Card padding="md" className="mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Email">
              <Input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="newmember@yourcompany.com"
                className="w-64"
              />
            </Field>
            <Field label="Role">
              <Select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as UserRow['role'])}
                className="w-44"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Button variant="primary" onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Send invite
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setInviteOpen(false);
                setInviteEmail('');
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <Card padding="none">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Member</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(user)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-xs text-slate-500">No members match your search.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Manage member"
        footer={
          editing ? (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setUsers(prev => prev.filter(u => u.id !== editing.id));
                  setEditing(null);
                }}
              >
                Remove member
              </Button>
              <Button variant="primary" onClick={() => setEditing(null)}>Done</Button>
            </div>
          ) : null
        }
      >
        {editing ? (
          <div className="space-y-3">
            <Field label="Name">
              <Input value={editing.name} onChange={e => updateUser({ name: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={editing.email} onChange={e => updateUser({ email: e.target.value })} />
            </Field>
            <Field label="Role">
              <Select
                value={editing.role}
                onChange={e => updateUser({ role: e.target.value as UserRow['role'] })}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={editing.status}
                onChange={e => updateUser({ status: e.target.value as UserRow['status'] })}
              >
                <option value="active">active</option>
                <option value="invited">invited</option>
                <option value="inactive">inactive</option>
              </Select>
            </Field>
          </div>
        ) : null}
      </Modal>
    </Page>
  );
}

// ── 6. Settings Dashboard ─────────────────────────────────────────────────

export function DashboardView() {
  const cards = [
    { icon: PaletteIcon,  label: 'Identity',      value: 'Configured'    },
    { icon: SettingsIcon, label: 'Preferences',   value: '5 settings'    },
    { icon: GlobeIcon,    label: 'Integrations',  value: '2 connected'   },
    { icon: LayersIcon,   label: 'Portal',        value: 'Custom domain' },
    { icon: Users2Icon,   label: 'Team',          value: '6 members'     },
    { icon: ShieldIcon,   label: 'Security',      value: '2FA enforced'  },
    { icon: BellIcon,     label: 'Notifications', value: 'Email digest'  },
    { icon: ZapIcon,      label: 'Activity',      value: 'Last 24 h'     },
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Settings"
        title="Dashboard"
        subtitle="Quick access to every configuration surface for your agency."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.label} padding="md" interactive>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">{card.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{card.value}</div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
