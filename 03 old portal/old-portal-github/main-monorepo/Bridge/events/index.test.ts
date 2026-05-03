import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BridgeEvents } from './index';

describe('Bridge events bus', () => {
  beforeEach(() => {
    // Reset internal listeners between tests by emitting once and clearing
    // (the bus has no public reset; subscribe-then-unsubscribe achieves the same)
    (BridgeEvents as any).listeners = {};
  });

  it('delivers an emitted payload to a subscribed listener', () => {
    const handler = vi.fn();
    BridgeEvents.on('CLIENT_PROVISIONED', handler);
    BridgeEvents.emit('CLIENT_PROVISIONED', { clientId: 'c1', name: 'Test Co' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ clientId: 'c1', name: 'Test Co' });
  });

  it('delivers to multiple listeners on the same event', () => {
    const a = vi.fn();
    const b = vi.fn();
    BridgeEvents.on('SUITE_ENABLED', a);
    BridgeEvents.on('SUITE_ENABLED', b);
    BridgeEvents.emit('SUITE_ENABLED', { suiteId: 'finance', agencyId: 'agency-1' });
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('does not deliver to unsubscribed listeners', () => {
    const handler = vi.fn();
    const unsub = BridgeEvents.on('USER_DEACTIVATED', handler);
    unsub();
    BridgeEvents.emit('USER_DEACTIVATED', { userId: 42 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('isolates listeners by event name', () => {
    const briefHandler = vi.fn();
    const invoiceHandler = vi.fn();
    BridgeEvents.on('BRIEF_CREATED', briefHandler);
    BridgeEvents.on('INVOICE_TRIGGER', invoiceHandler);
    BridgeEvents.emit('BRIEF_CREATED', { briefId: 'b1', clientId: 'c1' });
    expect(briefHandler).toHaveBeenCalledOnce();
    expect(invoiceHandler).not.toHaveBeenCalled();
  });

  it('once() runs the listener exactly once', () => {
    const handler = vi.fn();
    BridgeEvents.once('PAYROLL_PROCESSED', handler);
    BridgeEvents.emit('PAYROLL_PROCESSED', { period: '2026-05', agencyId: 'agency-1' });
    BridgeEvents.emit('PAYROLL_PROCESSED', { period: '2026-06', agencyId: 'agency-1' });
    expect(handler).toHaveBeenCalledOnce();
  });
});
