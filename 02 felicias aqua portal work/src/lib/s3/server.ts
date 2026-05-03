// Minimal S3-compatible client using AWS Signature V4 over plain fetch.
//
// No SDK dependency — Node's crypto is enough for SigV4. Works against
// AWS S3, Cloudflare R2, Backblaze B2 (S3-compat), MinIO, DigitalOcean
// Spaces, etc. — anywhere that speaks the S3 REST API + SigV4.
//
// Scope: the four operations the Backups runtime needs — PUT, GET,
// DELETE, and a prefix-filtered LIST (V2). Path-style addressing is
// used so custom endpoints work (R2, MinIO etc. don't all do
// virtual-host style cleanly).
//
// Reference: https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html

import "server-only";
import crypto from "crypto";

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Custom endpoint (e.g. https://<account>.r2.cloudflarestorage.com or http://localhost:9000). Defaults to AWS. */
  endpoint?: string;
}

const SERVICE = "s3";
const ALGO = "AWS4-HMAC-SHA256";

function sha256Hex(input: string | Buffer): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function signingKey(secret: string, date: string, region: string): Buffer {
  const kDate = hmac("AWS4" + secret, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function nowStamps(): { amzDate: string; dateStamp: string } {
  const d = new Date();
  const iso = d.toISOString().replace(/[:-]|\..*/g, "");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

function endpointHost(config: S3Config): { origin: string; host: string } {
  if (config.endpoint) {
    const u = new URL(config.endpoint);
    return { origin: `${u.protocol}//${u.host}`, host: u.host };
  }
  // Path-style AWS S3.
  const host = `s3.${config.region}.amazonaws.com`;
  return { origin: `https://${host}`, host };
}

function encodePath(p: string): string {
  // Encode each segment but keep slashes — S3 wants the canonical
  // resource path slash-preserved.
  return p.split("/").map(seg => encodeURIComponent(seg)).join("/");
}

interface SignedRequest {
  url: string;
  headers: Record<string, string>;
}

interface SignInput {
  method: "GET" | "PUT" | "DELETE";
  config: S3Config;
  /** Object key (no leading slash). For LIST pass undefined and use queryString. */
  key?: string;
  /** Pre-encoded query string (no leading "?"). Used for ListObjectsV2. */
  queryString?: string;
  body?: string | Buffer;
  contentType?: string;
}

function signRequest({ method, config, key, queryString = "", body, contentType }: SignInput): SignedRequest {
  const { origin, host } = endpointHost(config);
  const { amzDate, dateStamp } = nowStamps();

  const path = "/" + encodePath(`${config.bucket}/${key ?? ""}`).replace(/\/$/, key ? "" : "");
  const payload = body ?? "";
  const payloadHash = sha256Hex(typeof payload === "string" ? Buffer.from(payload) : payload);

  const baseHeaders: Record<string, string> = {
    "host": host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) baseHeaders["content-type"] = contentType;

  // Canonical headers: lowercase keys, trimmed values, sorted by key.
  const sortedKeys = Object.keys(baseHeaders).sort();
  const canonicalHeaders = sortedKeys.map(k => `${k}:${baseHeaders[k].trim()}`).join("\n") + "\n";
  const signedHeaders = sortedKeys.join(";");

  // Canonical query string: key=value pairs, URI-encoded, sorted.
  // queryString comes in pre-encoded; we re-sort to be safe.
  const canonicalQuery = queryString
    ? queryString.split("&").sort().join("&")
    : "";

  const canonicalRequest = [
    method,
    path,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    ALGO,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = hmac(signingKey(config.secretAccessKey, dateStamp, config.region), stringToSign).toString("hex");
  const authorization = `${ALGO} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `${origin}${path}${canonicalQuery ? `?${canonicalQuery}` : ""}`,
    headers: { ...baseHeaders, authorization },
  };
}

// ── Public operations ────────────────────────────────────────────────────

export async function s3Put(config: S3Config, key: string, body: string, contentType = "application/octet-stream"): Promise<void> {
  const req = signRequest({ method: "PUT", config, key, body, contentType });
  const res = await fetch(req.url, { method: "PUT", headers: req.headers, body, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`S3 PUT ${key} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

export async function s3Get(config: S3Config, key: string): Promise<string> {
  const req = signRequest({ method: "GET", config, key });
  const res = await fetch(req.url, { method: "GET", headers: req.headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`S3 GET ${key} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return res.text();
}

export async function s3Delete(config: S3Config, key: string): Promise<void> {
  const req = signRequest({ method: "DELETE", config, key });
  const res = await fetch(req.url, { method: "DELETE", headers: req.headers, cache: "no-store" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`S3 DELETE ${key} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

export interface S3ListEntry {
  key: string;
  size: number;
  lastModified: string;
}

export async function s3List(config: S3Config, prefix = ""): Promise<S3ListEntry[]> {
  // ListObjectsV2 is the modern flat-list endpoint. Pagination via
  // continuation-token; we loop until done.
  const results: S3ListEntry[] = [];
  let continuationToken: string | undefined;

  do {
    const params = new URLSearchParams({ "list-type": "2", prefix });
    if (continuationToken) params.set("continuation-token", continuationToken);
    const queryString = params.toString();
    const req = signRequest({ method: "GET", config, key: "", queryString });
    const res = await fetch(req.url, { method: "GET", headers: req.headers, cache: "no-store" });
    if (!res.ok) {
      throw new Error(`S3 LIST failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    const xml = await res.text();
    // Tiny extractors — full XML parser is overkill for a known schema.
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const body = m[1];
      const key = body.match(/<Key>([^<]*)<\/Key>/)?.[1];
      const size = parseInt(body.match(/<Size>(\d+)<\/Size>/)?.[1] ?? "0", 10);
      const lastModified = body.match(/<LastModified>([^<]*)<\/LastModified>/)?.[1] ?? "";
      if (key) results.push({ key, size, lastModified });
    }
    const truncated = xml.match(/<IsTruncated>([^<]*)<\/IsTruncated>/)?.[1] === "true";
    continuationToken = truncated
      ? xml.match(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/)?.[1]
      : undefined;
  } while (continuationToken);

  return results;
}
