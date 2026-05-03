import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Auto-Sync Engine
 * Hooks into /api/sync to post data automatically to Prisma backend.
 * Gracefully handles offline/unavailable API scenarios.
 */
export function useSyncStore(activeAgencyId: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const failCountRef = useRef(0);
  const MAX_FAILS = 3; // Stop retrying after 3 consecutive failures

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const syncToDatabase = useCallback((key: string, value: any, immediate = false) => {
    if (!activeAgencyId) return;

    // If we've failed too many times, stop spamming the API
    if (failCountRef.current >= MAX_FAILS) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const executeSync = async () => {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, agencyId: activeAgencyId }),
        });

        if (!res.ok) {
          failCountRef.current++;
          if (failCountRef.current >= MAX_FAILS) {
            console.warn(`[Auto-Sync] Disabled after ${MAX_FAILS} failures. Data is in-memory only.`);
          }
          return;
        }

        // Reset fail counter on success
        failCountRef.current = 0;
      } catch {
        failCountRef.current++;
        if (failCountRef.current >= MAX_FAILS) {
          console.warn(`[Auto-Sync] Disabled — API unreachable. Data is in-memory only.`);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    if (immediate) {
      executeSync();
    } else {
      debounceRef.current = setTimeout(executeSync, 2000); // 2-second debounce
    }
  }, [activeAgencyId]);

  return { syncToDatabase, isSyncing };
}
