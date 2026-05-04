// `PluginApiRoute[]` exposed by the website-editor plugin manifest.
//
// All routes mount under `/api/portal/website-editor/<path>` (foundation
// catchall). Tenant comes from the session via `requireRole()`; siteId
// comes from query/body and is validated against clientId in the
// handler scope check.

import type { PluginApiRoute } from "../lib/aquaPluginTypes";
import {
  handleListPages,
  handleCreatePage,
  handleGetPage,
  handleGetPageBySlug,
  handleUpdatePage,
  handlePublishPage,
  handleRevertPage,
  handleDeletePage,
  handleListPortalVariants,
  handleSetActivePortalVariant,
} from "./handlers/pages";
import {
  handleListThemes,
  handleCreateTheme,
  handleGetTheme,
  handleUpdateTheme,
  handleSetDefaultTheme,
  handleDeleteTheme,
} from "./handlers/themes";
import {
  handleGetContent,
  handleSetDraftContent,
  handlePublishContent,
  handleDiscardContent,
  handleRevertContent,
  handleContentDiscovery,
  handlePreviewToken,
  handleContentState,
} from "./handlers/content";
import {
  handleListSites,
  handleGetSite,
  handleCreateSite,
  handleUpdateSite,
  handleDeleteSite,
} from "./handlers/sites";
import {
  handleListEmbeds,
  handleSetEmbeds,
  handleListPublicEmbeds,
  handleGetEmbedTheme,
  handleUpdateEmbedTheme,
} from "./handlers/embeds";
import {
  handleListDiscoveries,
  handleHeartbeat,
  handleDismissDiscovery,
  handleConfirmDiscovery,
  handleConfigStub,
} from "./handlers/discoveries";
import { handlePromote } from "./handlers/promote";
import { handleListAssets, handleUploadAsset, handleDeleteAsset } from "./handlers/assets";

export const apiRoutes: PluginApiRoute[] = [
  // Pages
  { path: "/pages", methods: ["GET"], handler: handleListPages },
  { path: "/pages", methods: ["POST"], handler: handleCreatePage },
  { path: "/pages/get", methods: ["GET"], handler: handleGetPage },
  { path: "/pages/by-slug", methods: ["GET"], handler: handleGetPageBySlug },
  { path: "/pages", methods: ["PATCH"], handler: handleUpdatePage },
  { path: "/pages/publish", methods: ["POST"], handler: handlePublishPage },
  { path: "/pages/revert", methods: ["POST"], handler: handleRevertPage },
  { path: "/pages", methods: ["DELETE"], handler: handleDeletePage },
  { path: "/portal-variants", methods: ["GET"], handler: handleListPortalVariants },
  { path: "/portal-variants/active", methods: ["POST"], handler: handleSetActivePortalVariant },

  // Themes
  { path: "/themes", methods: ["GET"], handler: handleListThemes },
  { path: "/themes", methods: ["POST"], handler: handleCreateTheme },
  { path: "/themes/get", methods: ["GET"], handler: handleGetTheme },
  { path: "/themes", methods: ["PATCH"], handler: handleUpdateTheme },
  { path: "/themes/default", methods: ["POST"], handler: handleSetDefaultTheme },
  { path: "/themes", methods: ["DELETE"], handler: handleDeleteTheme },

  // Content
  { path: "/content", methods: ["GET"], handler: handleGetContent },
  { path: "/content/draft", methods: ["POST"], handler: handleSetDraftContent },
  { path: "/content/publish", methods: ["POST"], handler: handlePublishContent },
  { path: "/content/discard", methods: ["POST"], handler: handleDiscardContent },
  { path: "/content/revert", methods: ["POST"], handler: handleRevertContent },
  { path: "/content/discovery", methods: ["POST"], handler: handleContentDiscovery },
  { path: "/content/preview-token", methods: ["POST"], handler: handlePreviewToken },
  { path: "/content/state", methods: ["GET"], handler: handleContentState },

  // Sites
  { path: "/sites", methods: ["GET"], handler: handleListSites },
  { path: "/sites", methods: ["POST"], handler: handleCreateSite },
  { path: "/sites/get", methods: ["GET"], handler: handleGetSite },
  { path: "/sites", methods: ["PATCH"], handler: handleUpdateSite },
  { path: "/sites", methods: ["DELETE"], handler: handleDeleteSite },

  // Embeds + embed-theme
  { path: "/embeds", methods: ["GET"], handler: handleListEmbeds },
  { path: "/embeds", methods: ["PUT"], handler: handleSetEmbeds },
  { path: "/embeds/public", methods: ["GET"], handler: handleListPublicEmbeds },
  { path: "/embed-theme", methods: ["GET"], handler: handleGetEmbedTheme },
  { path: "/embed-theme", methods: ["PUT"], handler: handleUpdateEmbedTheme },

  // Discoveries
  { path: "/discoveries", methods: ["GET"], handler: handleListDiscoveries },
  { path: "/discoveries/heartbeat", methods: ["POST"], handler: handleHeartbeat },
  { path: "/discoveries/dismiss", methods: ["POST"], handler: handleDismissDiscovery },
  { path: "/discoveries/confirm", methods: ["POST"], handler: handleConfirmDiscovery },

  // Config snapshot used by storefront overlay
  { path: "/config", methods: ["GET"], handler: handleConfigStub },

  // Promote (GitHub PR)
  { path: "/promote", methods: ["POST"], handler: handlePromote },

  // Assets — Round-1 stubs
  { path: "/assets", methods: ["GET"], handler: handleListAssets },
  { path: "/assets", methods: ["POST"], handler: handleUploadAsset },
  { path: "/assets", methods: ["DELETE"], handler: handleDeleteAsset },
];
