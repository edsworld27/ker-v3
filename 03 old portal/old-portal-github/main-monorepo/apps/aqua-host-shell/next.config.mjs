import path from 'path';
import { fileURLToPath } from 'url';
import { withPayload } from '@payloadcms/next/withPayload';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_DIR = path.resolve(__dirname, '..');

/**
 * Cross-workspace plugin aliases.
 *
 * The host shell tsconfig deliberately does NOT declare these — that would
 * pull every sub-app's source tree into the host's typecheck graph (each
 * sub-app uses different path aliases for its own internal imports). The
 * bootstrap loader uses @ts-expect-error to suppress the "module not found"
 * type error; at runtime Webpack / Turbopack uses the aliases below.
 */
const PLUGIN_ALIASES = {
  '@FinanceShell': path.join(APPS_DIR, 'aqua-ops-finance/FinanceShell'),
  '@PeopleShell': path.join(APPS_DIR, 'aqua-ops-people/PeopleShell'),
  '@RevenueShell': path.join(APPS_DIR, 'aqua-ops-revenue/RevenueShell'),
  '@ClientShell': path.join(APPS_DIR, 'aqua-client/ClientShell'),
  '@CRMShell': path.join(APPS_DIR, 'aqua-crm/CRMShell'),
  '@OpsHubShell': path.join(APPS_DIR, 'aqua-operations/OpsHubShell'),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  transpilePackages: ['@aqua/bridge'],
  typescript: {
    // Sub-app tsconfigs aren't unified with the host's. Static type-checks
    // across the workspace are tracked per-app via `npm run typecheck`.
    // Disabling here only affects `next build`'s TS gate, not editor types.
    ignoreBuildErrors: true,
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    // Hosts the portal needs to talk to / load assets from.
    // - vercel.live: Vercel Live preview comment widget (script + frame)
    // - va.vercel-scripts.com: Vercel Web Analytics
    // - data:/blob:: inline + uploaded images, fonts
    const csp = [
      "default-src 'self'",
      // Next.js + bundler ergonomics: script chunks come from 'self'; we keep
      // 'unsafe-inline' for the small inline bootstrap script Next emits, and
      // 'unsafe-eval' in dev for React Refresh / Turbopack HMR.
      `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://vercel.live https://va.vercel-scripts.com`,
      // Tailwind injects its style sheet via <style>; keep 'unsafe-inline'.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Same-origin API calls + Vercel Live websocket for live preview.
      `connect-src 'self' https://vercel.live wss://vercel.live${isProd ? '' : ' ws: http://localhost:* http://127.0.0.1:*'}`,
      "frame-src 'self' https://vercel.live",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(isProd ? ['upgrade-insecure-requests'] : []),
    ].join('; ');

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
      },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ];

    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    resolveAlias: PLUGIN_ALIASES,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), ...PLUGIN_ALIASES };
    return config;
  },
};

export default withPayload(nextConfig);
