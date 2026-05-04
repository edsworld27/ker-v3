// Main editor page — Live · Block · Code modes with Simple · Full · Pro
// complexity tiers. Round-1 ships a structural placeholder that
// satisfies the PluginPageProps contract; the full UI port from
// `02/src/app/admin/editor/page.tsx` lands in Round 2.

import type { PluginPageProps } from "../lib/aquaPluginTypes";

export default function EditorPageComponent(props: PluginPageProps) {
  return (
    <div data-page="editor" data-client-id={props.clientId}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Editor</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Live · Block · Code editor for {props.clientId ?? "your client"}.
        </p>
      </header>
      <section style={{ padding: 16 }}>
        <p style={{ fontSize: 13, color: "#374151" }}>
          Round-1 placeholder. Full editor (3 modes × 3 complexity tiers, outliner,
          properties panel, publish modal) lifts from
          <code> 02/src/app/admin/editor/* </code> in Round 2.
        </p>
      </section>
    </div>
  );
}
