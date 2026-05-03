import { useState, useEffect, useCallback } from 'react';
import { usePortalLogic } from '../../PortalView/logic/ClientusePortalLogic';

export function useWebStudio() {
  const { activeClient, currentUser } = usePortalLogic();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Website Config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      // We first need to ensure we are "logged in" to Payload
      // In a real app, this would be handled by a more robust SSO flow.
      // For now, we'll try to fetch directly. Payload's access control 
      // will return 401 if we don't have the cookie.
      
      const res = await fetch('/api/website-config', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized: Please ensure you are logged into the CMS.');
        }
        throw new Error(`Failed to fetch config: ${res.statusText}`);
      }

      const data = await res.json();
      // Since WebsiteConfig is a collection with one config per tenant,
      // Payload returns an array (docs). 
      // But because of our access control, we should only see 0 or 1 doc.
      if (data.docs && data.docs.length > 0) {
        setConfig(data.docs[0]);
      } else {
        setConfig(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Media
  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.docs || []);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  }, []);

  // 3. Save Config
  const saveConfig = useCallback(async (updatedFields: any) => {
    if (!config?.id) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/website-config/${config.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Failed to save changes');

      const data = await res.json();
      setConfig(data.doc);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [config?.id]);

  useEffect(() => {
    fetchConfig();
    fetchMedia();
  }, [fetchConfig, fetchMedia]);

  return {
    config,
    media,
    loading,
    saving,
    error,
    saveConfig,
    refresh: fetchConfig
  };
}
