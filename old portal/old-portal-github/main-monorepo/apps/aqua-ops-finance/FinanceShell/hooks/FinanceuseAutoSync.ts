import { useEffect, useRef } from 'react';
import { useFinanceContext } from '@FinanceShell/bridge/FinanceContext';
import { useSyncStore } from './FinanceuseSyncStore';

/**
 * Drop-in Auto-Sync hook for new Suite Contexts.
 * Automatically syncs the provided state to the database whenever it changes.
 * 
 * @param key   The unique database key (e.g., 'hr_data', 'sales_pipeline')
 * @param state The state object/array to sync
 */
export function useAutoSync<T>(key: string, state: T) {
  const { activeAgencyId } = useFinanceContext();
  const { syncToDatabase } = useSyncStore(activeAgencyId);
  
  // Track initial render to prevent unnecessary syncing when the context first mounts
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // syncToDatabase inherently handles debouncing (1000ms default)
    syncToDatabase(key, state);
    
  }, [key, state, syncToDatabase]);
}
