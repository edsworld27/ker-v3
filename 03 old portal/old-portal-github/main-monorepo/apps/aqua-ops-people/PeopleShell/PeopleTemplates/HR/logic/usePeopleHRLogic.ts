import { useMemo, useState } from 'react';
import { peopleStore, usePeopleEmployees, usePeopleJobs, type Dept, type Employee } from '../../store/peopleStore';

const DEPARTMENTS: Dept[] = ['Engineering', 'Design', 'Marketing', 'Legal', 'Finance', 'Operations'];

export const usePeopleHRLogic = () => {
  const allEmployees = usePeopleEmployees();
  const jobs = usePeopleJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Dept | null>(null);
  const [profileOpen, setProfileOpen] = useState<Employee | null>(null);
  const [postRoleOpen, setPostRoleOpen] = useState(false);
  const [auditToast, setAuditToast] = useState<string | null>(null);

  // Department counts (real, computed from store)
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of allEmployees) {
      counts[e.dept] = (counts[e.dept] ?? 0) + 1;
    }
    return counts;
  }, [allEmployees]);

  // Apply search + dept filter
  const employees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEmployees.filter(e => {
      if (selectedDept && e.dept !== selectedDept) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q) ||
        (e.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [allEmployees, searchQuery, selectedDept]);

  const expiringClearances = useMemo(
    () => allEmployees.filter(e => e.clearanceExpiresOn).length,
    [allEmployees],
  );

  const onPostRole = () => setPostRoleOpen(true);
  const onViewProfile = (e: Employee) => setProfileOpen(e);
  const onAuditNow = () => {
    peopleStore.startComplianceAudit();
    setAuditToast(`Audit started — reviewing ${expiringClearances} expiring clearance${expiringClearances === 1 ? '' : 's'}.`);
    setTimeout(() => setAuditToast(null), 4500);
  };

  return {
    employees,
    allEmployees,
    departments: DEPARTMENTS,
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
  };
};
