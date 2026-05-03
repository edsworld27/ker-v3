import React, { Suspense, useState, useEffect } from 'react';
import { usePeopleContext } from '@PeopleShell/bridge/PeopleContext';
import { SmartRegistry } from '@PeopleShell/components/PeopleSmartRegistry';
import { demoComponentMap } from '@PeopleShell/bridge/demo/PeopledemoComponentMap';
import { BridgeRegistry } from '@PeopleShell/bridge/PeopleRegistration';

interface DynamicViewRendererProps {
  viewId: string;
  suiteId?: string;
  sharedProps?: Record<string, unknown>;
}

export const DynamicViewRenderer: React.FC<DynamicViewRendererProps> = ({
  viewId,
  suiteId,
  sharedProps = {},
}) => {
  const { portalMode } = usePeopleContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    return BridgeRegistry.subscribe(() => setTick(t => t + 1));
  }, []);

  const Component =
    portalMode === 'demo' && demoComponentMap[viewId]
      ? demoComponentMap[viewId]
      : SmartRegistry[viewId];

  if (!Component) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center p-8 bg-black/20 rounded-2xl border border-white/5 border-dashed">
          <h2 className="text-xl font-bold text-white/50 mb-2">Component Not Registered</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold font-mono">"{viewId}"</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 animate-pulse text-slate-500 italic uppercase tracking-widest text-xs">Initializing {viewId}...</div>}>
      <Component suiteId={suiteId} {...sharedProps} />
    </Suspense>
  );
};
