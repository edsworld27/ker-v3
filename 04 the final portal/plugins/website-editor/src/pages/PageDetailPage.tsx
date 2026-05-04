// Page detail admin page. Round-1 structural placeholder; full UI port from
// 02/src/app/admin/pageDetail/* lands in Round 2.

import type { PluginPageProps } from "../lib/aquaPluginTypes";

export default function PageDetailPageComponent(props: PluginPageProps) {
  return (
    <div data-page="pageDetail" data-client-id={props.clientId}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Page detail</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Page settings + slug + theme override.
        </p>
      </header>
      <section style={{ padding: 16, fontSize: 13, color: "#374151" }}>
        <p>Round-1 placeholder for {props.clientId ?? "the active client"}.</p>
      </section>
    </div>
  );
}
