# `src/components/AIChatbot/` — Gemini-powered chatbot

A floating chatbot widget that uses Google's `@google/genai` SDK to talk to the Gemini API.

## Files

```
AIChatbot/
├── AIChatbot.tsx     ← Component
├── ui.ts             ← Tailwind classes as `aiChatbotUI`
└── index.ts          ← Re-exports as default
```

## How it works

1. Chatbot is mounted somewhere in the app (typically as a floating button in the bottom-right corner).
2. User clicks → a chat panel opens with an input field and message history.
3. Each user message is sent to `gemini-pro` (or whichever model the SDK is initialized with).
4. Streaming or full response is displayed in the chat history.

## Configuration

Requires `GEMINI_API_KEY` in `.env.local`. Loaded by Vite at build time.

```bash
# .env.local
GEMINI_API_KEY=your_key_here
```

The app boots without the key — only this widget is non-functional. No console errors are thrown unless the user actually sends a message.

## When extracting

- **Most reusable as a pattern**, not as code. Lift the chat-bubble layout, the input handling, and the streaming-message rendering — but rewire the API call to whatever AI provider you actually use.
- The `@google/genai` SDK is a heavy dependency for a single widget. If you're not committed to Gemini specifically, swap for a lighter or provider-agnostic abstraction.
- If you DO keep Gemini: register the API key handling at the top level of your app, not inline. The component as-is reads `import.meta.env.VITE_GEMINI_API_KEY` style — exposing the key client-side. Move calls to a server proxy for production.

## Privacy note

Anything the user types into this chatbot is sent to Google. If you're handling client data in your SaaS app, do NOT extract this widget without first thinking through what conversations get sent and where.
