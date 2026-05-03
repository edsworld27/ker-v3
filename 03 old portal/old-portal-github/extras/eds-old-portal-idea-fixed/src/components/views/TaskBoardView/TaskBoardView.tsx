import React from 'react';
import { TasksStatsWidget } from '../../widgets/TasksStatsWidget';
import { TaskBoardWidget } from '../../widgets/TaskBoardWidget';
import { PortalView } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

export const TaskBoardView: React.FC = () => {
  const { setPortalView } = useAppContext();

  // The original TaskBoardView props are now handled by the widgets themselves,
  // which will use context or receive their own specific props if needed.
  // This component now acts as a container for the decomposed widgets.

  return (
    <div className="w-full p-4 md:p-8">
      <TasksStatsWidget variant="bar" />
      <TaskBoardWidget />
    </div>
  );
};
