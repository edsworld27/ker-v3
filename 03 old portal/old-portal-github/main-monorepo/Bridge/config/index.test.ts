import { describe, it, expect } from 'vitest';
import {
  APP_PORTS,
  APP_LABELS,
  APP_DEV_URLS,
  BRIDGE_LS_KEYS,
  ROLE_PRODUCT_MAP,
  DEMO_EMAIL,
  BRIDGE_MESSAGE_TYPES,
  DEFAULT_THEME,
  SESSION_TTL_MS,
} from './index';

describe('Bridge config — app port wiring', () => {
  it('declares ports for all 7 apps', () => {
    expect(Object.keys(APP_PORTS).sort()).toEqual(
      ['client', 'crm', 'finance', 'host', 'operations', 'people', 'revenue']
    );
  });

  it('uses contiguous ports 3001-3007', () => {
    const sortedPorts = Object.values(APP_PORTS).sort();
    expect(sortedPorts).toEqual([3001, 3002, 3003, 3004, 3005, 3006, 3007]);
  });

  it('host shell is on 3001', () => {
    expect(APP_PORTS.host).toBe(3001);
  });

  it('APP_LABELS covers every key in APP_PORTS', () => {
    for (const name of Object.keys(APP_PORTS)) {
      expect(APP_LABELS).toHaveProperty(name);
      expect(typeof APP_LABELS[name as keyof typeof APP_LABELS]).toBe('string');
    }
  });

  it('APP_DEV_URLS is derived from APP_PORTS', () => {
    expect(APP_DEV_URLS.host).toBe('http://localhost:3001');
    expect(APP_DEV_URLS.revenue).toBe('http://localhost:3007');
  });
});

describe('Bridge config — role/product map', () => {
  it('Founder has access to all 7 products', () => {
    expect(ROLE_PRODUCT_MAP.Founder).toHaveLength(7);
  });

  it('ClientOwner is restricted to client only', () => {
    expect(ROLE_PRODUCT_MAP.ClientOwner).toEqual(['client']);
  });

  it('AgencyEmployee can NOT access ops sub-hubs (finance/people/revenue)', () => {
    const access = ROLE_PRODUCT_MAP.AgencyEmployee as readonly string[];
    expect(access).not.toContain('finance');
    expect(access).not.toContain('people');
    expect(access).not.toContain('revenue');
  });
});

describe('Bridge config — misc constants', () => {
  it('DEMO_EMAIL is the well-known dev address', () => {
    expect(DEMO_EMAIL).toBe('demo@aqua.portal');
  });

  it('BRIDGE_LS_KEYS has the expected set of localStorage keys', () => {
    expect(BRIDGE_LS_KEYS.PORTAL_STATE).toBe('aqua_portal_state');
    expect(BRIDGE_LS_KEYS.SESSION).toBe('aqua_session');
  });

  it('BRIDGE_MESSAGE_TYPES enumerates the postMessage protocol', () => {
    expect(BRIDGE_MESSAGE_TYPES).toContain('BRIDGE_AUTH');
    expect(BRIDGE_MESSAGE_TYPES).toContain('BRIDGE_READY');
  });

  it('DEFAULT_THEME provides primary + secondary fallbacks', () => {
    expect(DEFAULT_THEME.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(DEFAULT_THEME.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('SESSION_TTL_MS is 7 days in milliseconds', () => {
    expect(SESSION_TTL_MS).toBe(1000 * 60 * 60 * 24 * 7);
  });
});
