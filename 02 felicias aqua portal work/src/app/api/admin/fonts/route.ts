import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FONT_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2"];

export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), "public", "fonts");
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({ fonts: [] });
    }

    const files = fs.readdirSync(fontsDir);
    const fontNames = Array.from(
      new Set(
        files
          .filter((f) => FONT_EXTENSIONS.includes(path.extname(f).toLowerCase()))
          .map((f) => {
            const name = path.basename(f, path.extname(f));
            return name
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .replace(/\s+(Bold|Italic|Light|Regular|Medium|Semibold|Black|Thin|ExtraBold|ExtraLight)\s*/gi, "")
              .trim();
          })
      )
    ).sort();

    return NextResponse.json({ fonts: fontNames });
  } catch {
    return NextResponse.json({ fonts: [] });
  }
}
