/**
 * useRoleConfig — stub hook
 * Returns the role configuration for the current user. `label` is a
 * lookup function that maps semantic keys ('clients', 'users', etc.) to
 * displayable strings — letting widgets adapt copy to the active role
 * (e.g. an agency role might render 'clients', a freelancer role 'leads').
 */
export function useRoleConfig() {
  const label = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);
  return {
    canEdit: true,
    canDelete: false,
    canCreate: true,
    role: 'admin',
    label,
  };
}
