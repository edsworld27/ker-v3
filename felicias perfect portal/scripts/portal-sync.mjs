#!/usr/bin/env node
// portal-sync — push a host site's portal.config.ts schema to the portal.
//
//   node scripts/portal-sync.mjs \
//     --site=felicia \
//     --portal=https://portal.example \
//     --config=portal.config.ts
//
// The host's portal.config.ts default-exports a ManifestSchema (built
// with definePortal). This script imports it via dynamic import() and
// POSTs the schema to /api/portal/schema/<siteId>.
//
// Notes:
// - Node 22+ ships native TypeScript stripping for `.ts` files, but
//   only when the file uses no syntax that needs erasure (definePortal
//   is the recommended shape for that reason). On older runtimes the
//   user can pre-compile with `tsc portal.config.ts` and pass
//   --config=portal.config.js — we'll fall back automatically.

import { resolve, dirname, isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { argv, exit, cwd } from "node:process";

function parseArgs(args) {
  const out = {};
  for (const a of args) {
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq < 0) {
      out[a.slice(2)] = true;
    } else {
      out[a.slice(2, eq)] = a.slice(eq + 1);
    }
  }
  return out;
}

function die(msg, code = 1) {
  console.error(`portal-sync: ${msg}`);
  exit(code);
}

const args = parseArgs(argv.slice(2));
const site = args.site || args.siteId;
const portal = args.portal;
const configPath = args.config || "portal.config.ts";

if (!site)   die("missing --site=<id>");
if (!portal) die("missing --portal=<url>");

const absolute = isAbsolute(configPath) ? configPath : resolve(cwd(), configPath);
const fallback = absolute.replace(/\.ts$/, ".js");

async function importConfig(p) {
  if (!existsSync(p)) return null;
  try {
    const mod = await import(pathToFileURL(p).href);
    return mod;
  } catch (err) {
    return { __error: err };
  }
}

let mod = await importConfig(absolute);
if (mod && mod.__error) {
  // Likely a TS-syntax barrier on the current Node runtime.
  if (existsSync(fallback)) {
    console.warn(`portal-sync: couldn't import ${configPath} directly, falling back to ${fallback}`);
    mod = await importConfig(fallback);
  } else {
    die(
      `couldn't import ${configPath}: ${mod.__error.message}\n` +
      `Hint: on Node <22 (or runtimes without .ts loader support), compile first:\n` +
      `        npx tsc ${configPath} --target esnext --module esnext --moduleResolution bundler\n` +
      `      then re-run with --config=${fallback.replace(dirname(absolute) + "/", "")}.`,
    );
  }
}
if (!mod) die(`config file not found: ${absolute}`);

const schema = mod.default ?? mod.schema;
if (!schema || typeof schema !== "object") {
  die(`${configPath}: must default-export a ManifestSchema (use definePortal({...}))`);
}

let fieldCount = 0;
let sectionCount = 0;
for (const [section, fields] of Object.entries(schema)) {
  if (!fields || typeof fields !== "object") continue;
  sectionCount += 1;
  fieldCount += Object.keys(fields).length;
}

const url = `${portal.replace(/\/$/, "")}/api/portal/schema/${encodeURIComponent(site)}`;
console.log(`portal-sync: uploading ${sectionCount} section${sectionCount === 1 ? "" : "s"} / ${fieldCount} field${fieldCount === 1 ? "" : "s"} → ${url}`);

let res;
try {
  res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schema, uploadedFrom: `portal-sync@${process.version}` }),
  });
} catch (err) {
  die(`network error: ${err.message}`);
}

if (!res.ok) {
  let body = "";
  try { body = await res.text(); } catch {}
  die(`upload failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
}

let payload = null;
try { payload = await res.json(); } catch {}

if (payload && payload.ok === false) {
  die(`portal rejected schema: ${payload.error || "unknown error"}`);
}

console.log(`portal-sync: ok — schema saved for site "${site}"`);
exit(0);
