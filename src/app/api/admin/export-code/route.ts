import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import zlib from "zlib";

// Builds a ZIP of the entire src/ directory using only Node built-ins.
// Uses STORE compression (no DEFLATE) to avoid pulling in a zip library.
// Each file is added with a CRC32 and proper local/central-directory headers.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function listFiles(dir: string, base: string, out: { rel: string; full: string }[] = []): typeof out {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);
    if (entry.isDirectory()) listFiles(full, base, out);
    else if (entry.isFile()) out.push({ rel, full });
  }
  return out;
}

function uint16(n: number) {
  const b = Buffer.alloc(2); b.writeUInt16LE(n, 0); return b;
}
function uint32(n: number) {
  const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0, 0); return b;
}

export async function GET() {
  try {
    const root = process.cwd();
    const srcDir = path.join(root, "src");
    if (!fs.existsSync(srcDir)) {
      return NextResponse.json({ error: "src/ not found" }, { status: 500 });
    }

    const files = listFiles(srcDir, root);
    // Also include package.json and key configs for context
    const extras = ["package.json", "tsconfig.json", "next.config.ts", "tailwind.config.ts", "postcss.config.mjs", "eslint.config.mjs", "AGENTS.md", "CLAUDE.md", "README.md"];
    for (const ex of extras) {
      const full = path.join(root, ex);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        files.push({ rel: ex, full });
      }
    }

    const localParts: Buffer[] = [];
    const centralParts: Buffer[] = [];
    let offset = 0;

    for (const { rel, full } of files) {
      const data = fs.readFileSync(full);
      // Compress with DEFLATE (raw, no zlib header) for smaller output
      const compressed = zlib.deflateRawSync(data, { level: 6 });
      const useDeflate = compressed.length < data.length;
      const stored = useDeflate ? compressed : data;
      const method = useDeflate ? 8 : 0; // 0=STORE, 8=DEFLATE

      const nameBuf = Buffer.from(rel.replace(/\\/g, "/"), "utf8");
      const crc = crc32(data);
      const compSize = stored.length;
      const uncompSize = data.length;

      // Local file header
      const local = Buffer.concat([
        uint32(0x04034b50),  // local file header signature
        uint16(20),          // version needed
        uint16(0),           // general purpose flag
        uint16(method),      // compression method
        uint16(0),           // mod time
        uint16(0),           // mod date
        uint32(crc),
        uint32(compSize),
        uint32(uncompSize),
        uint16(nameBuf.length),
        uint16(0),           // extra field length
        nameBuf,
        stored,
      ]);
      localParts.push(local);

      const central = Buffer.concat([
        uint32(0x02014b50),  // central directory header signature
        uint16(20),          // version made by
        uint16(20),          // version needed
        uint16(0),           // flags
        uint16(method),
        uint16(0),
        uint16(0),
        uint32(crc),
        uint32(compSize),
        uint32(uncompSize),
        uint16(nameBuf.length),
        uint16(0),           // extra
        uint16(0),           // comment
        uint16(0),           // disk number
        uint16(0),           // internal attrs
        uint32(0),           // external attrs
        uint32(offset),      // local header offset
        nameBuf,
      ]);
      centralParts.push(central);

      offset += local.length;
    }

    const central = Buffer.concat(centralParts);
    const localData = Buffer.concat(localParts);

    const eocd = Buffer.concat([
      uint32(0x06054b50),
      uint16(0), uint16(0),
      uint16(files.length),
      uint16(files.length),
      uint32(central.length),
      uint32(localData.length),
      uint16(0),
    ]);

    const zip = Buffer.concat([localData, central, eocd]);

    return new NextResponse(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="luv-ker-source-${new Date().toISOString().slice(0, 10)}.zip"`,
        "Content-Length": String(zip.length),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
