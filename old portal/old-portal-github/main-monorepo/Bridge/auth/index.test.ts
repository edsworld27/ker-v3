import { describe, it, expect } from 'vitest';
import { authenticate, DEMO_EMAIL, DEMO_SESSION } from './index';

describe('Bridge auth — demo shortcut', () => {
  it('returns DEMO_SESSION for the canonical demo email', async () => {
    const result = await authenticate(DEMO_EMAIL);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session).toBe(DEMO_SESSION);
      expect(result.session.isDemo).toBe(true);
      expect(result.session.enabledSuiteIds).toEqual(['*']);
    }
  });

  it('also accepts the short alias "demo"', async () => {
    const result = await authenticate('demo');
    expect(result.success).toBe(true);
    if (result.success) expect(result.session.isDemo).toBe(true);
  });

  it('demo user has Founder role with all three product accesses', () => {
    expect(DEMO_SESSION.user.role).toBe('Founder');
    expect(DEMO_SESSION.productAccess).toContain('operations');
    expect(DEMO_SESSION.productAccess).toContain('client');
    expect(DEMO_SESSION.productAccess).toContain('crm');
  });

  it('demo agency has expected id and is configured', () => {
    expect(DEMO_SESSION.agency.id).toBe('demo-agency');
    expect(DEMO_SESSION.agency.isConfigured).toBe(true);
  });
});
