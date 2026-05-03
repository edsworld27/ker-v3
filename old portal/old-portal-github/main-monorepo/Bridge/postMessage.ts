/**
 * @aqua/bridge/postMessage
 * 
 * Cross-origin communication protocol for the Micro-Frontend Shell.
 * The Host Shell sends auth/theme/config to embedded apps via postMessage.
 * Embedded apps send navigation requests back to the host.
 */

// ── Message Types ────────────────────────────────────────────────────────────

export type BridgeMessageType =
  | 'BRIDGE_AUTH'           // Host → App: Send auth token + user + permissions
  | 'BRIDGE_NAVIGATE'       // App → Host: Request sidebar navigation change
  | 'BRIDGE_SYNC'           // Bidirectional: Arbitrary state sync
  | 'BRIDGE_STATE_UPDATED'  // App → Host: Notify host that a global state key changed
  | 'BRIDGE_THEME'          // Host → App: Sync CSS custom properties
  | 'BRIDGE_READY'          // App → Host: App iframe has loaded and is ready
  | 'BRIDGE_PING';          // Host → App: Heartbeat check

// ── State Update Payload ─────────────────────────────────────────────────────

export interface BridgeStateUpdatedPayload {
  key: string;
  value: any;
  category?: 'config' | 'user' | 'client' | 'system';
}

export interface BridgeMessage {
  type: BridgeMessageType;
  payload: any;
  source: 'aqua-host' | 'aqua-client' | 'aqua-crm' | 'aqua-operations' | 'aqua-ops-finance' | 'aqua-ops-people' | 'aqua-ops-revenue';
  timestamp: number;
}

// ── Auth Payload ─────────────────────────────────────────────────────────────

export interface BridgeAuthPayload {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    customRoleId?: string;
  };
  permissions: {
    allowedViews: string[] | '*';
    isFounder: boolean;
    isInternalStaff: boolean;
    canImpersonate: boolean;
  };
  activeClient?: {
    id: string;
    name: string;
    stage: string;
    enabledSuiteIds: string[];
  } | null;
  impersonatingClientId?: string | null;
  sessionToken?: string;
}

// ── Theme Payload ────────────────────────────────────────────────────────────

export interface BridgeThemePayload {
  primaryColor: string;
  secondaryColor: string;
  bgBase: string;
  textPrimary: string;
  fontFamily: string;
  [key: string]: string;
}

// ── Navigate Payload ─────────────────────────────────────────────────────────

export interface BridgeNavigatePayload {
  viewId: string;
  params?: Record<string, string>;
}

// ── Security Constants ───────────────────────────────────────────────────────

/**
 * Valid origins allowed to communicate via the Bridge.
 * In production, these should be restricted to your specific domains.
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  // Wildcards for production staging/prod domains can be added here
];

const getOriginForSource = (source: BridgeMessage['source']): string => {
  switch (source) {
    case 'aqua-host':         return 'http://localhost:3001';
    case 'aqua-client':       return 'http://localhost:3002';
    case 'aqua-crm':          return 'http://localhost:3003';
    case 'aqua-operations':   return 'http://localhost:3004';
    case 'aqua-ops-finance':  return 'http://localhost:3005';
    case 'aqua-ops-people':   return 'http://localhost:3006';
    case 'aqua-ops-revenue':  return 'http://localhost:3007';
    default:                  return '*';
  }
};

/**
 * Send a Bridge message to a target window (iframe or parent).
 */
export function sendBridgeMessage(
  target: Window,
  type: BridgeMessageType,
  payload: any,
  source: BridgeMessage['source'],
  targetOrigin?: string
) {
  const message: BridgeMessage = {
    type,
    payload,
    source,
    timestamp: Date.now(),
  };

  // Default to the specific origin of the target app if not provided
  const origin = targetOrigin || (source === 'aqua-host' ? '*' : getOriginForSource('aqua-host'));
  
  target.postMessage(message, origin);
}

/**
 * Listen for Bridge messages. Returns an unsubscribe function.
 */
export function onBridgeMessage(
  handler: (message: BridgeMessage) => void,
  filter?: BridgeMessageType[]
): () => void {
  const listener = (event: MessageEvent) => {
    // 1. Validate Origin
    const isAllowed = ALLOWED_ORIGINS.includes(event.origin) || event.origin === window.location.origin;
    if (!isAllowed && process.env.NODE_ENV === 'production') {
      console.warn(`[Bridge] Security Alert: Blocked message from unauthorized origin: ${event.origin}`);
      return;
    }

    const data = event.data as BridgeMessage;
    
    // 2. Validate Structure
    if (!data?.type || !data?.source?.startsWith('aqua-')) return;
    
    // 3. Apply optional type filter
    if (filter && !filter.includes(data.type)) return;
    
    handler(data);
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

