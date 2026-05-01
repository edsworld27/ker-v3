"use client";

// Thin client wrapper around next/dynamic so the root layout (a Server
// Component) can include ChatBot without SSR. Next 16 rejects
// `dynamic({ ssr: false })` from Server Components — moving it behind a
// "use client" boundary keeps the same lazy-load behaviour.

import dynamic from "next/dynamic";

const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });

export default function ChatBotLazy() {
  return <ChatBot />;
}
