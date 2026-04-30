"use client";

import { useEffect, useState } from "react";
import {
  listTeam, listRoles, inviteTeamMember, updateTeamMember, removeTeamMember,
  saveRole, createRole, deleteRole, onTeamChange,
  ALL_RESOURCES, ALL_ACTIONS,
  type TeamMember, type Role, type Resource, type Action, type RolePermission,
} from "@/lib/admin/team";

// ── helpers ───────────────────────────────────────────────────────────────────

function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const p = role.permissions.find((x) => x.resource === resource);
  return p?.actions.includes(action) ?? false;
}

function togglePermission(role: Role, resource: Resource, action: Action): Role {
  const permissions = role.permissions.map((p) => ({ ...p, actions: [...p.actions] }));
  const idx = permissions.findIndex((p) => p.resource === resource);
  if (idx >= 0) {
    const acts = permissions[idx].actions;
    const ai = acts.indexOf(action);
    if (ai >= 0) acts.splice(ai, 1);
    else acts.push(action);
  } else {
    permissions.push({ resource, actions: [action] });
  }
  return { ...role, permissions };
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  invited: "bg-brand-amber/20 text-brand-amber",
  suspended: "bg-red-500/20 text-red-400",
};

const ROLE_COLOR_OPTIONS = [
  "#E8621A","#F2A23C","#6B2D8B","#8B4AAD","#3B82F6","#10B981","#EF4444","#EC4899","#F59E0B","#6366F1",
];

// ── sub-components ────────────────────────────────────────────────────────────

function InviteModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "viewer");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name) return;
    inviteTeamMember({ email, name, roleId, note: note || undefined });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-brand-black-soft border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <h2 className="font-display text-xl text-brand-cream">Invite team member</h2>
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>
        <Field label="Role">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Note (optional)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-brand-cream/60 hover:text-brand-cream">Cancel</button>
          <button type="submit" className="px-5 py-2 text-sm bg-brand-orange text-white rounded-xl font-semibold">Invite</button>
        </div>
      </form>
    </div>
  );
}

function RoleEditor({ role, onSave, onDelete, onCancel }: {
  role: Role;
  onSave: (r: Role) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState<Role>(role);

  const groups = Array.from(new Set(ALL_RESOURCES.map((r) => r.group)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-brand-black-soft border border-white/10 rounded-2xl my-6 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl text-brand-cream">
            {role.isSystem ? `Role: ${role.name}` : "Edit role"}
          </h2>
          <button onClick={onCancel} className="text-brand-cream/40 hover:text-brand-cream text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {!role.isSystem && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Role name">
                <input
                  value={local.name}
                  onChange={(e) => setLocal({ ...local, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
                />
              </Field>
              <Field label="Description">
                <input
                  value={local.description}
                  onChange={(e) => setLocal({ ...local, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
                />
              </Field>
              <Field label="Badge colour">
                <div className="flex gap-2 flex-wrap">
                  {ROLE_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setLocal({ ...local, color: c })}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${local.color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Permission matrix */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-cream/40 mb-3">Permissions</p>
            {role.isSystem && (
              <p className="text-xs text-brand-cream/35 mb-3">System roles cannot be edited. Clone this role to customise it.</p>
            )}
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.02]">
                    <th className="text-left px-4 py-2.5 text-brand-cream/40 font-medium text-xs">Resource</th>
                    {ALL_ACTIONS.map((a) => (
                      <th key={a.action} className="text-center px-3 py-2.5 text-brand-cream/40 font-medium text-xs">{a.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const resources = ALL_RESOURCES.filter((r) => r.group === group);
                    return (
                      <>
                        <tr key={`group-${group}`} className="border-b border-white/5 bg-white/[0.01]">
                          <td colSpan={6} className="px-4 py-1.5 text-[10px] tracking-[0.18em] uppercase text-brand-cream/30 font-semibold">{group}</td>
                        </tr>
                        {resources.map((r) => (
                          <tr key={r.resource} className="border-b border-white/5 last:border-0 hover:bg-white/[0.015]">
                            <td className="px-4 py-2.5 text-brand-cream/70 text-sm">{r.label}</td>
                            {ALL_ACTIONS.map((a) => {
                              const checked = hasPermission(local, r.resource, a.action);
                              return (
                                <td key={a.action} className="text-center px-3 py-2.5">
                                  <button
                                    disabled={role.isSystem}
                                    onClick={() => setLocal(togglePermission(local, r.resource, a.action))}
                                    className={`w-5 h-5 rounded border mx-auto block transition-colors ${
                                      checked
                                        ? "border-brand-orange bg-brand-orange"
                                        : "border-white/20 bg-transparent"
                                    } ${role.isSystem ? "opacity-60 cursor-default" : "hover:border-brand-orange/70 cursor-pointer"}`}
                                  >
                                    {checked && <span className="block text-white text-[11px] leading-5">✓</span>}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {onDelete && !role.isSystem && (
              <button onClick={onDelete} className="text-xs px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10">Delete role</button>
            )}
            {role.isSystem && (
              <button
                onClick={() => {
                  const cloned = createRole({ name: `${role.name} (copy)`, color: role.color, description: role.description, permissions: role.permissions.map(p => ({ ...p, actions: [...p.actions] })) });
                  onSave(cloned);
                }}
                className="text-xs px-3 py-2 rounded-lg border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10"
              >
                Clone role
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="text-xs px-4 py-2 text-brand-cream/60 hover:text-brand-cream">Cancel</button>
            {!role.isSystem && (
              <button
                onClick={() => { onSave(local); }}
                className="text-xs px-5 py-2 bg-brand-orange text-white rounded-xl font-semibold"
              >Save role</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "members" | "roles";

export default function AdminTeamPage() {
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editMember, setEditMember] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => { setMembers(listTeam()); setRoles(listRoles()); };
    refresh();
    return onTeamChange(refresh);
  }, []);

  function roleFor(roleId: string): Role | undefined {
    return roles.find((r) => r.id === roleId);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">People</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Team &amp; roles</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            Invite team members and define what each role can see and do.
          </p>
        </div>
        {tab === "members" && (
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 text-sm bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-dark"
          >
            + Invite member
          </button>
        )}
        {tab === "roles" && (
          <button
            onClick={() => setEditRole({ id: "", name: "", color: "#6B2D8B", description: "", isSystem: false, permissions: [], createdAt: Date.now() })}
            className="px-4 py-2 text-sm bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-dark"
          >
            + Create role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8">
        {(["members", "roles"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-brand-orange text-brand-cream" : "border-transparent text-brand-cream/50 hover:text-brand-cream/80"
            }`}
          >
            {t} {t === "members" ? `(${members.length})` : `(${roles.length})`}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {tab === "members" && (
        <div className="space-y-2">
          {members.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <p className="text-brand-cream/40 text-sm">No team members yet.</p>
              <button onClick={() => setShowInvite(true)} className="mt-3 text-brand-orange text-sm hover:underline">Invite someone →</button>
            </div>
          )}
          {members.map((m) => {
            const role = roleFor(m.roleId);
            return (
              <div key={m.id} className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-white/15">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: role?.color ?? "#555" }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-cream truncate">{m.name}</p>
                  <p className="text-xs text-brand-cream/45 truncate">{m.email}</p>
                </div>
                {role && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: role.color + "33", color: role.color }}>
                    {role.name}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status]}`}>
                  {m.status}
                </span>
                <div className="flex items-center gap-1">
                  {editMember === m.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={m.roleId}
                        onChange={(e) => { updateTeamMember(m.id, { roleId: e.target.value }); setEditMember(null); }}
                        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-brand-cream"
                      >
                        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <select
                        defaultValue={m.status}
                        onChange={(e) => { updateTeamMember(m.id, { status: e.target.value as TeamMember["status"] }); setEditMember(null); }}
                        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-brand-cream"
                      >
                        <option value="active">Active</option>
                        <option value="invited">Invited</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <button onClick={() => setEditMember(null)} className="text-xs text-brand-cream/40 hover:text-brand-cream px-1">✕</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setEditMember(m.id)} className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-brand-cream/50 hover:text-brand-cream hover:border-white/30">Edit</button>
                      <button onClick={() => { if (confirm(`Remove ${m.name}?`)) removeTeamMember(m.id); }} className="text-xs px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40">Remove</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roles tab */}
      {tab === "roles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setEditRole(r)}
              className="text-left p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg" style={{ background: r.color + "33", border: `1.5px solid ${r.color}55` }}>
                  <div className="w-3 h-3 rounded-full m-[8px]" style={{ background: r.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-cream">{r.name}</p>
                  {r.isSystem && <p className="text-[10px] text-brand-cream/30">System</p>}
                </div>
              </div>
              <p className="text-xs text-brand-cream/45 mb-3 line-clamp-2">{r.description}</p>
              <p className="text-[11px] text-brand-cream/30">
                {r.permissions.reduce((n, p) => n + p.actions.length, 0)} permissions across{" "}
                {r.permissions.filter((p) => p.actions.length > 0).length} resources
              </p>
              <p className="text-[11px] text-brand-orange/70 mt-1 group-hover:text-brand-orange">
                {r.isSystem ? "View / clone →" : "Edit →"}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showInvite && <InviteModal roles={roles} onClose={() => setShowInvite(false)} />}
      {editRole && (
        <RoleEditor
          role={editRole}
          onSave={(updated) => {
            if (updated.id) saveRole(updated);
            setEditRole(null);
            setRoles(listRoles());
          }}
          onDelete={editRole.id ? () => { deleteRole(editRole.id); setEditRole(null); setRoles(listRoles()); } : undefined}
          onCancel={() => setEditRole(null)}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-brand-cream/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
