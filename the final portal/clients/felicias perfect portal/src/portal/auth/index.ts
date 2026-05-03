// Auth: users, sessions, team, roles, impersonation, support tickets.
// All re-exports from existing modules — see src/portal/README.md.

export * from "@/lib/auth";

// `team` defines its own richer RBAC `Role` interface that conflicts with
// auth's simple `Role = "customer" | "admin"` alias. Re-export team's role
// types under a more specific name.
export {
  ALL_RESOURCES, ALL_ACTIONS,
  listRoles, getRole, saveRole, deleteRole, createRole,
  listTeam, getTeamMember, getTeamMemberByEmail,
  inviteTeamMember, updateTeamMember, removeTeamMember,
  getPermissionsForEmail, canDo, onTeamChange,
  type Resource, type Action, type RolePermission,
  type Role as TeamRole,
  type MemberStatus, type TeamMember,
} from "@/lib/admin/team";

export * from "@/lib/admin/tickets";
