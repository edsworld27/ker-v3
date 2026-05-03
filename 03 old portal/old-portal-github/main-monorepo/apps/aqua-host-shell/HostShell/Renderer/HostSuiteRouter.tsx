import React, { useState, useEffect } from 'react';
import { useHostContext } from '@HostShell/bridge/HostContext';
import { SUITE_METADATA } from '@HostShell/bridge/HostsuiteRegistry';
import { HostRegistration } from '@HostShell/bridge/HostRegistration';
import { SmartRegistry } from '@HostShell/components/HostSmartRegistry';

interface SuiteRouterProps {
  suiteId: string;
  defaultViewId?: string;
  fallback?: React.ReactNode;
  sharedProps?: Record<string, any>;
}

/**
 * SuiteRouter - The Dynamic Modular Routing Engine
 * 
 * Automatically resolves sub-view IDs to registered components
 * within a business suite using the Bridge Registry.
 */
export const SuiteRouter: React.FC<SuiteRouterProps> = ({ 
  suiteId, 
  defaultViewId,
  fallback,
  sharedProps = {}
}) => {
  const { portalView } = useHostContext();

  // Force re-render when HostRegistration updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return HostRegistration.subscribe(() => setTick(t => t + 1));
  }, []);
  
  // Find the suite in the bridge metadata
  const suite = SUITE_METADATA.find(s => s.id === suiteId);
  
  if (!suite) {
    console.error(`SuiteRouter: Suite ID "${suiteId}" not found in metadata.`);
    return fallback || <div className="p-8 text-center opacity-50">Suite metadata not found.</div>;
  }

  /**
   * Helper to find if a viewId exists anywhere in a branch of the registry
   */
  const findDeepItem = (items: any[], targetId: string): any | null => {
    for (const item of items) {
      if (item.id === targetId || item.view === targetId) return item;
      if (item.children) {
        const found = findDeepItem(item.children, targetId);
        if (found) return item; // Return the immediate child that contains the target
      }
    }
    return null;
  };

  // Determine which sub-item component to render
  let componentIdToResolve: string = (portalView === suiteId && defaultViewId) ? defaultViewId : (portalView as string);

  // If the target view is deep inside this suite, find the top-level subItem that owns it
  if (suite.subItems) {
    const ownerItem = findDeepItem(suite.subItems, componentIdToResolve);
    if (ownerItem) {
      componentIdToResolve = ownerItem.id;
    }
  }

  // Resolve component from the Bridge Registry
  const Component = HostRegistration.resolve(componentIdToResolve) || SmartRegistry[componentIdToResolve];
  
  if (Component) {
    return (
      <div className="suite-route-container animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Component {...sharedProps} />
      </div>
    );
  }

  // Fallback to the suite's default state if no sub-view component is found
  if (defaultViewId && componentIdToResolve !== defaultViewId) {
    const DefaultComponent = HostRegistration.resolve(defaultViewId) || SmartRegistry[defaultViewId];
    if (DefaultComponent) {
      return <DefaultComponent {...sharedProps} />;
    }
  }

  return (
    <div className="p-16 text-center">
      <h3 className="text-xl font-semibold opacity-50 italic">Modular Routing Engine Active</h3>
      <p className="text-sm opacity-30 mt-2 tracking-widest uppercase font-bold">Waiting for Component Resolution: "{componentIdToResolve}"</p>
    </div>
  );
};
