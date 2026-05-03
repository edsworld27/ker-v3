/**
 * Bridge Event Bus
 *
 * Decoupled cross-suite and cross-product communication.
 * No direct imports between products — they talk through events.
 *
 * Events emitted in AQUA Client can be heard in Operations and vice versa.
 *
 * Usage:
 *   import { BridgeEvents } from '@aqua/bridge/events'
 *   BridgeEvents.emit('CLIENT_STAGE_CHANGED', { clientId, stage })
 *   BridgeEvents.on('CLIENT_STAGE_CHANGED', ({ clientId, stage }) => { ... })
 */

type EventCallback<T = any> = (data: T) => void;

// Typed event catalogue — add new events here as the system grows
export interface BridgeEventMap {
  // Client lifecycle
  CLIENT_PROVISIONED:    { clientId: string; name: string };
  CLIENT_STAGE_CHANGED:  { clientId: string; stage: string };

  // Fulfilment
  BRIEF_CREATED:         { briefId: string; clientId: string };
  DELIVERABLE_SUBMITTED: { deliverableId: string; briefId: string; clientId: string };
  DELIVERABLE_APPROVED:  { deliverableId: string; clientId: string };
  DELIVERABLE_REVISION:  { deliverableId: string; notes: string };

  // Finance triggers (Operations Finance suite listens)
  INVOICE_TRIGGER:       { clientId: string; deliverableId: string };

  // User management
  USER_INVITED:          { email: string; role: string; agencyId: string };
  USER_DEACTIVATED:      { userId: number };

  // Cross-suite signals
  PAYROLL_PROCESSED:     { period: string; agencyId: string };
  SUITE_ENABLED:         { suiteId: string; agencyId: string };
  SUITE_DISABLED:        { suiteId: string; agencyId: string };
}

class BridgeEventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on<K extends keyof BridgeEventMap>(
    event: K,
    callback: EventCallback<BridgeEventMap[K]>
  ): () => void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback as EventCallback);
    // Return unsubscribe
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit<K extends keyof BridgeEventMap>(event: K, data?: BridgeEventMap[K]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BridgeEvents] ${String(event)}`, data);
    }
    (this.listeners[event] ?? []).forEach(cb => cb(data));
  }

  /** One-time listener */
  once<K extends keyof BridgeEventMap>(
    event: K,
    callback: EventCallback<BridgeEventMap[K]>
  ) {
    const unsub = this.on(event, (data) => {
      callback(data as BridgeEventMap[K]);
      unsub();
    });
  }
}

export const BridgeEvents = new BridgeEventBus();
