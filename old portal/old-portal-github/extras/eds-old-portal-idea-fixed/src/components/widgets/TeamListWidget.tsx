import React from 'react';
import { UserCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

export function TeamListWidget() {
  const { users, agencyConfig } = useAppContext();
  const theme = useTheme();
  const { label } = useRoleConfig();

  const agencyUsers = users.filter(u => !u.role.startsWith('Client')).slice(0, 6);

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" style={{ color: theme.primary }} />
          <h3 className="text-sm font-semibold">{label('team')}</h3>
        </div>
        <span className="text-[10px] text-slate-500">{agencyUsers.length} members</span>
      </div>

      <div className="space-y-1.5">
        {agencyUsers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No team members yet.</p>
        ) : (
          agencyUsers.map(user => {
            const roleCfg = user.customRoleId
              ? agencyConfig.roles[user.customRoleId]
              : agencyConfig.roles[user.role];
            const displayRole = roleCfg?.displayName ?? user.role;
            const accentColor = roleCfg?.accentColor ?? theme.primary;

            return (
              <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: accentColor }}>
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold shrink-0"
                  style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                  {displayRole}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
