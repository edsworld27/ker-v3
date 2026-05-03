import React from 'react';
import { useRevenueContext as useSalesContext } from '../ClientRevenueContext';
import { SuiteRouter } from '@ClientShell/Renderer/ClientSuiteRouter';

/**
 * ClientManagementView — Client Portfolio Dispatcher
 * Refactored to use the Omega Modular Routing Engine (SuiteRouter).
 */
export const ClientManagementView: React.FC = () => {
  const context = useSalesContext();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--client-widget-bg-color-1)] animate-in fade-in duration-500">
      {/* Content Dispatcher */}
      <div className="flex-1 overflow-auto custom-scrollbar p-0">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Dynamic Routing Engine handles component resolution and prop mapping */}
          <SuiteRouter 
            suiteId="client-management" 
            defaultViewId="clients-overview" 
            sharedProps={context}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientManagementView;