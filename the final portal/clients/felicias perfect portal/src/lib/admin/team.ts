"use client";

const ROLES_KEY = "lk_admin_roles_v1";
const TEAM_KEY = "lk_admin_team_v1";
const CHANGE_EVENT = "lk-team-change";

// ── Permission types ──────────────────────────────────────────────────────────

export type Resource =
  | "overview" | "orders" | "customers" | "marketing"
  | "products" | "collections" | "inventory" | "reviews"
  | "blog" | "faq" | "pages" | "website" | "theme" | "sections"
  | "split_test" | "funnels"
  | "team" | "support" | "shipping" | "settings";

export type Action = "view" | "create" | "edit" | "delete" | "publish";

export interface RolePermission {
  resource: Resource;
  actions: Action[];
}

export const ALL_RESOURCES: Array<{ resource: Resource; label: string; group: string }> = [
  { resource: "overview",    label: "Overview dashboard", group: "Sell" },
  { resource: "orders",      label: "Orders",             group: "Sell" },
  { resource: "customers",   label: "Customers",          group: "Sell" },
  { resource: "marketing",   label: "Marketing",          group: "Sell" },
  { resource: "products",    label: "Products",           group: "Catalog" },
  { resource: "collections", label: "Collections",        group: "Catalog" },
  { resource: "inventory",   label: "Inventory",          group: "Catalog" },
  { resource: "reviews",     label: "Reviews",            group: "Catalog" },
  { resource: "blog",        label: "Blog",               group: "Content" },
  { resource: "faq",         label: "FAQ",                group: "Content" },
  { resource: "pages",       label: "Custom pages",       group: "Content" },
  { resource: "website",     label: "Website editor",     group: "Content" },
  { resource: "theme",       label: "Theme & styling",    group: "Design" },
  { resource: "sections",    label: "Section layout",     group: "Design" },
  { resource: "split_test",  label: "Split testing",      group: "Growth" },
  { resource: "funnels",     label: "Funnels",            group: "Growth" },
  { resource: "support",     label: "Support",            group: "Ops" },
  { resource: "shipping",    label: "Shipping",           group: "Ops" },
  { resource: "settings",    label: "Settings",           group: "Ops" },
  { resource: "team",        label: "Team & roles",       group: "Ops" },
];

export const ALL_ACTIONS: Array<{ action: Action; label: string }> = [
  { action: "view",    label: "View" },
  { action: "edit",    label: "Edit" },
  { action: "create",  label: "Create" },
  { action: "delete",  label: "Delete" },
  { action: "publish", label: "Publish" },
];

// ── Role ─────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  color: string;
  description: string;
  permissions: RolePermission[];
  isSystem: boolean;
  createdAt: number;
}

const SYSTEM_ROLES: Role[] = [
  {
    id: "admin",
    name: "Admin",
    color: "#E8621A",
    description: "Full access to everything",
    isSystem: true,
    permissions: ALL_RESOURCES.map((r) => ({
      resource: r.resource,
      actions: ["view", "create", "edit", "delete", "publish"] as Action[],
    })),
    createdAt: 0,
  },
  {
    id: "editor",
    name: "Editor",
    color: "#6B2D8B",
    description: "Can create and edit content, cannot manage team or settings",
    isSystem: true,
    permissions: (["blog", "faq", "pages", "website", "products", "inventory", "reviews"] as Resource[]).map(
      (r) => ({ resource: r, actions: ["view", "create", "edit", "publish"] as Action[] })
    ).concat(
      (["overview", "orders", "customers", "collections"] as Resource[]).map(
        (r) => ({ resource: r, actions: ["view"] as Action[] })
      )
    ),
    createdAt: 0,
  },
  {
    id: "viewer",
    name: "Viewer",
    color: "#F2A23C",
    description: "Read-only access",
    isSystem: true,
    permissions: ALL_RESOURCES.map((r) => ({
      resource: r.resource,
      actions: ["view"] as Action[],
    })),
    createdAt: 0,
  },
];

function readRoles(): Role[] {
  if (typeof window === "undefined") return SYSTEM_ROLES;
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    const custom: Role[] = raw ? (JSON.parse(raw) as Role[]) : [];
    return [...SYSTEM_ROLES, ...custom];
  } catch {
    return SYSTEM_ROLES;
  }
}

function writeRoles(custom: Role[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLES_KEY, JSON.stringify(custom));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listRoles(): Role[] {
  return readRoles();
}

export function getRole(id: string): Role | undefined {
  return readRoles().find((r) => r.id === id);
}

export function saveRole(role: Role) {
  if (role.isSystem) return;
  const custom = readRoles().filter((r) => !r.isSystem);
  const idx = custom.findIndex((r) => r.id === role.id);
  if (idx >= 0) custom[idx] = role;
  else custom.push(role);
  writeRoles(custom);
}

export function deleteRole(id: string) {
  const custom = readRoles().filter((r) => !r.isSystem && r.id !== id);
  writeRoles(custom);
}

export function createRole(partial: Omit<Role, "id" | "isSystem" | "createdAt">): Role {
  const role: Role = {
    ...partial,
    id: crypto.randomUUID(),
    isSystem: false,
    createdAt: Date.now(),
  };
  const custom = readRoles().filter((r) => !r.isSystem);
  custom.push(role);
  writeRoles(custom);
  return role;
}

// ── Team member ───────────────────────────────────────────────────────────────

export type MemberStatus = "active" | "invited" | "suspended";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  roleId: string;
  status: MemberStatus;
  avatar?: string;
  note?: string;
  createdAt: number;
  lastSeenAt?: number;
}

function readTeam(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    return raw ? (JSON.parse(raw) as TeamMember[]) : [];
  } catch {
    return [];
  }
}

function writeTeam(members: TeamMember[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEAM_KEY, JSON.stringify(members));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listTeam(): TeamMember[] {
  return readTeam();
}

export function getTeamMember(id: string): TeamMember | undefined {
  return readTeam().find((m) => m.id === id);
}

export function getTeamMemberByEmail(email: string): TeamMember | undefined {
  return readTeam().find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export function inviteTeamMember(
  partial: Omit<TeamMember, "id" | "status" | "createdAt">
): TeamMember {
  const member: TeamMember = {
    ...partial,
    id: crypto.randomUUID(),
    status: "invited",
    createdAt: Date.now(),
  };
  const members = readTeam();
  members.push(member);
  writeTeam(members);
  return member;
}

export function updateTeamMember(id: string, patch: Partial<TeamMember>) {
  const members = readTeam();
  const idx = members.findIndex((m) => m.id === id);
  if (idx < 0) return;
  members[idx] = { ...members[idx], ...patch };
  writeTeam(members);
}

export function removeTeamMember(id: string) {
  writeTeam(readTeam().filter((m) => m.id !== id));
}

// ── Permission checking ───────────────────────────────────────────────────────

export function getPermissionsForEmail(email: string): RolePermission[] {
  const member = getTeamMemberByEmail(email);
  if (!member) return [];
  const role = getRole(member.roleId);
  return role?.permissions ?? [];
}

export function canDo(
  email: string | undefined,
  resource: Resource,
  action: Action,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  if (!email) return false;
  const perms = getPermissionsForEmail(email);
  const perm = perms.find((p) => p.resource === resource);
  return perm?.actions.includes(action) ?? false;
}

export function onTeamChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
