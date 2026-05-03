import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendBridgeMessage, onBridgeMessage } from './postMessage';
import type { BridgeMessage, BridgeAuthPayload } from './postMessage';

describe('Bridge postMessage — sendBridgeMessage', () => {
  it('posts a structured BridgeMessage to the target window', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    const payload: BridgeAuthPayload = {
      user: { id: '1', email: 'a@b.c', name: 'A', role: 'Founder' },
      permissions: { allowedViews: '*', isFounder: true, isInternalStaff: true, canImpersonate: true },
    };
    sendBridgeMessage(target, 'BRIDGE_AUTH', payload, 'aqua-host');

    expect(target.postMessage).toHaveBeenCalledOnce();
    const [msg, origin] = (target.postMessage as any).mock.calls[0];
    expect(msg.type).toBe('BRIDGE_AUTH');
    expect(msg.source).toBe('aqua-host');
    expect(msg.payload).toEqual(payload);
    expect(typeof msg.timestamp).toBe('number');
    expect(typeof origin).toBe('string');
  });

  it('uses a wildcard origin when source is aqua-host (host → child)', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    sendBridgeMessage(target, 'BRIDGE_PING', {}, 'aqua-host');
    const [, origin] = (target.postMessage as any).mock.calls[0];
    expect(origin).toBe('*');
  });

  it('accepts all 7 app sources (extended union)', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    const sources: BridgeMessage['source'][] = [
      'aqua-host', 'aqua-client', 'aqua-crm', 'aqua-operations',
      'aqua-ops-finance', 'aqua-ops-people', 'aqua-ops-revenue',
    ];
    for (const src of sources) {
      sendBridgeMessage(target, 'BRIDGE_READY', { viewId: 'x' }, src);
    }
    expect((target.postMessage as any).mock.calls).toHaveLength(7);
  });
});

describe('Bridge postMessage — onBridgeMessage', () => {
  let listeners: Array<(e: MessageEvent) => void>;
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;

  beforeEach(() => {
    listeners = [];
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;
    window.addEventListener = ((evt: string, cb: any) => {
      if (evt === 'message') listeners.push(cb);
    }) as any;
    window.removeEventListener = ((evt: string, cb: any) => {
      if (evt === 'message') listeners = listeners.filter(l => l !== cb);
    }) as any;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('invokes the handler for a valid message from window.location origin', () => {
    const handler = vi.fn();
    const unsub = onBridgeMessage(handler);
    expect(listeners).toHaveLength(1);

    const msg: BridgeMessage = {
      type: 'BRIDGE_READY',
      payload: { viewId: 'dashboard' },
      source: 'aqua-client',
      timestamp: Date.now(),
    };
    listeners[0](new MessageEvent('message', { data: msg, origin: window.location.origin }));
    expect(handler).toHaveBeenCalledWith(msg);

    unsub();
    expect(listeners).toHaveLength(0);
  });

  it('ignores messages with malformed shape (missing type or source)', () => {
    const handler = vi.fn();
    onBridgeMessage(handler);
    listeners[0](new MessageEvent('message', { data: { foo: 'bar' }, origin: window.location.origin }));
    listeners[0](new MessageEvent('message', { data: { type: 'BRIDGE_PING' }, origin: window.location.origin }));
    listeners[0](new MessageEvent('message', { data: { source: 'not-aqua', type: 'BRIDGE_PING' }, origin: window.location.origin }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('honors the optional type filter', () => {
    const handler = vi.fn();
    onBridgeMessage(handler, ['BRIDGE_AUTH']);

    const auth: BridgeMessage = { type: 'BRIDGE_AUTH', payload: {}, source: 'aqua-host', timestamp: 0 };
    const ping: BridgeMessage = { type: 'BRIDGE_PING', payload: {}, source: 'aqua-host', timestamp: 0 };
    listeners[0](new MessageEvent('message', { data: auth, origin: window.location.origin }));
    listeners[0](new MessageEvent('message', { data: ping, origin: window.location.origin }));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(auth);
  });
});
