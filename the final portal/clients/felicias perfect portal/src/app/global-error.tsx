"use client";

// Last-resort error boundary. Required by Next.js — wraps the entire
// app including the root layout. Triggered when the layout itself
// throws or an error escapes /src/app/error.tsx. Renders its own <html>
// since the layout chain may be broken.

import { useEffect } from "react";

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[global-error.tsx]", error);
  }, [error]);

  return (
    <html>
      <body style={{
        background: "#0a0a0a",
        color: "#f4ebd9",
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "1.5rem",
      }}>
        <div style={{ maxWidth: 440 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#fca5a5", marginBottom: 16 }}>
            Critical error
          </p>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Something broke badly.</h1>
          <p style={{ fontSize: 13, color: "rgba(244,235,217,0.65)", lineHeight: 1.6, marginBottom: 16 }}>
            The app couldn&apos;t recover from an error in its root layout. This shouldn&apos;t happen — the team has been notified via the build logs.
          </p>
          {error.digest && (
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(244,235,217,0.35)", marginBottom: 16 }}>
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: "rgba(255,107,53,0.15)",
              color: "#ff6b35",
              border: "1px solid rgba(255,107,53,0.3)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
