import React from 'react';
import { useEnterpriseContext } from '../ClientEnterpriseContext';
import { SuiteRouter } from '@ClientShell/Renderer/ClientSuiteRouter';

/**
 * FulfillmentView — Operational Delivery & Production Dispatcher
 * Refactored to use the Omega Modular Routing Engine (SuiteRouter).
 */
export const FulfillmentView: React.FC = () => {
  const context = useEnterpriseContext();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--client-widget-bg-color-1)] animate-in fade-in duration-1000">
      {/* Content Dispatcher */}
      <div className="flex-1 overflow-auto custom-scrollbar p-0">
        <div className="max-w-[1900px] mx-auto w-full">
          {/* Dynamic Routing Engine handles component resolution and prop mapping */}
          <SuiteRouter 
            suiteId="fulfillment-view" 
            defaultViewId="ff-production" 
            sharedProps={context}
          />
        </div>
      </div>
    </div>
  );
};

export default FulfillmentView;
