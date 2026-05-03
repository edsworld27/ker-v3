import React from 'react';
import { AdminStatsWidget } from '../../widgets/AdminStatsWidget';
import { AdminActivityWidget } from '../../widgets/AdminActivityWidget';

export const AdminDashboardView: React.FC = () => {
  // This component now acts as a container for the decomposed widgets.
  // Data fetching and role-specific logic are handled within the widgets.
  return (
    <div className="w-full p-4 md:p-8">
      <AdminStatsWidget />
      <AdminActivityWidget />
    </div>
  );
};

export default AdminDashboardView;
