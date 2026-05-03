import { describe, it, expect, beforeEach } from 'vitest';
import { BridgeRegistry } from './index';

const StubComponent = () => null;

describe('Bridge registry — components', () => {
  beforeEach(() => {
    // Wipe singleton state between tests
    if (typeof window !== 'undefined') {
      (window as any).__BRIDGE_COMPONENTS__ = {};
      (window as any).__BRIDGE_SUITES__ = {};
      (window as any).__BRIDGE_PROVIDERS__ = {};
    }
  });

  it('registers and resolves a component by id', () => {
    BridgeRegistry.register('test-view', StubComponent);
    expect(BridgeRegistry.resolve('test-view')).toBe(StubComponent);
  });

  it('auto-aliases PascalCase ids to hyphenated form', () => {
    BridgeRegistry.register('SomeView', StubComponent);
    expect(BridgeRegistry.resolve('SomeView')).toBe(StubComponent);
    expect(BridgeRegistry.resolve('some-view')).toBe(StubComponent);
  });

  it('resolve returns null for unknown ids', () => {
    expect(BridgeRegistry.resolve('does-not-exist')).toBeNull();
  });

  it('registerAll registers every entry in one call', () => {
    const A = () => null;
    const B = () => null;
    BridgeRegistry.registerAll({ 'view-a': A, 'view-b': B });
    expect(BridgeRegistry.resolve('view-a')).toBe(A);
    expect(BridgeRegistry.resolve('view-b')).toBe(B);
  });

  it('getRegisteredIds reflects the current set', () => {
    BridgeRegistry.register('alpha', StubComponent);
    BridgeRegistry.register('beta', StubComponent);
    const ids = BridgeRegistry.getRegisteredIds();
    expect(ids).toContain('alpha');
    expect(ids).toContain('beta');
  });
});

describe('Bridge registry — suites', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      (window as any).__BRIDGE_SUITES__ = {};
    }
  });

  it('registers and retrieves a suite by id', () => {
    const suite = { id: 'finance', label: 'Finance', icon: () => null } as any;
    BridgeRegistry.registerSuite(suite);
    expect(BridgeRegistry.getSuite('finance')).toEqual(suite);
  });

  it('getSuites lists all registered suites', () => {
    BridgeRegistry.registerSuite({ id: 'a', label: 'A' } as any);
    BridgeRegistry.registerSuite({ id: 'b', label: 'B' } as any);
    const ids = BridgeRegistry.getSuites().map(s => s.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
  });

  it('getSuite returns null for unknown id', () => {
    expect(BridgeRegistry.getSuite('nope')).toBeNull();
  });
});

describe('Bridge registry — subscriptions', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      (window as any).__BRIDGE_COMPONENTS__ = {};
    }
  });

  it('notifies subscribers on register()', () => {
    let calls = 0;
    const unsub = BridgeRegistry.subscribe(() => { calls += 1; });
    BridgeRegistry.register('x', StubComponent);
    expect(calls).toBe(1);
    unsub();
    BridgeRegistry.register('y', StubComponent);
    expect(calls).toBe(1);
  });
});
