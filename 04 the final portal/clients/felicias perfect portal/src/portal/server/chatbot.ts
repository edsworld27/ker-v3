// Server-side store for per-site chatbot configuration (T1 #3).
//
// The storefront ships a built-in chatbot (`src/components/ChatBot.tsx`)
// that handles FAQ / order-status / discount queries locally. This module
// lets each site pick a different provider (built-in, custom GPT-style,
// or one of the 3rd-party widgets configured via EmbedsBlock) and
// customise the welcome copy + system prompt without touching code.
//
// Mirrors the shape of tracking.ts / embedTheme.ts:
//   getChatbotConfig / setChatbotConfig
//
// Validation lives at the route boundary; this layer trusts its inputs
// and just persists them. Throwing here would couple storage to HTTP.

import { getState, mutate } from "./storage";
import type { ChatbotConfig } from "./types";

export type { ChatbotConfig };

// "Use the built-in bot with default copy" — the runtime in
// src/components/ChatBot.tsx supplies its own welcome message + system
// prompt fallbacks when these fields are absent.
const DEFAULT_CONFIG: ChatbotConfig = {
  provider: "portal-builtin",
  enabled: true,
};

export function getChatbotConfig(siteId: string): ChatbotConfig {
  return getState().chatbots[siteId] ?? DEFAULT_CONFIG;
}

export function setChatbotConfig(siteId: string, config: ChatbotConfig): ChatbotConfig {
  let saved!: ChatbotConfig;
  mutate(state => {
    // Strip empty strings so "is this set?" checks downstream work cleanly
    // — empty in == "use built-in default", not "store empty".
    const cleaned: ChatbotConfig = {
      provider: config.provider,
      enabled: !!config.enabled,
    };
    if (config.value?.trim())          cleaned.value = config.value.trim();
    if (config.welcomeMessage?.trim()) cleaned.welcomeMessage = config.welcomeMessage.trim();
    if (config.systemPrompt?.trim())   cleaned.systemPrompt = config.systemPrompt.trim();
    if (config.position === "bottom-right" || config.position === "bottom-left") {
      cleaned.position = config.position;
    }
    if (config.accentColor?.trim())    cleaned.accentColor = config.accentColor.trim();
    state.chatbots[siteId] = cleaned;
    saved = cleaned;
  });
  return saved;
}

export function clearChatbotConfig(siteId: string): void {
  mutate(state => { delete state.chatbots[siteId]; });
}
