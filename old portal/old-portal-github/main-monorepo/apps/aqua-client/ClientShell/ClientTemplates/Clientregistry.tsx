import { Layout } from 'lucide-react';

// Sub-Registries
import { PortalRegistry } from './PortalView/Clientregistry';

/**
 * AquaClientMasterRegistry
 * The single source of truth for the AQUA Client domain.
 */
export const AquaClientMasterRegistry = {
  id: 'aqua-client-root',
  label: 'Client Portal',
  icon: Layout,
  
  suites: [
    PortalRegistry
  ],

  components: {}
};

export default AquaClientMasterRegistry;
