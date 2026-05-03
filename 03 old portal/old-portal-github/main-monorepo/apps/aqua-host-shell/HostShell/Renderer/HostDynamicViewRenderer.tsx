/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { BridgeRegistry } from '@aqua/bridge/registry';
import { RegistryViewRenderer } from './HostRegistryViewRenderer';
import { IFrameViewRenderer } from './HostIFrameViewRenderer';
import { TemplateHubView } from '@HostShell/components/TemplateHub/HostTemplateHubView';
import {
  AgencyConfiguratorView,
  GlobalSettingsView,
  IntegrationsView,
  AgencyBuilderView,
  AllUsersView,
  DashboardView,
} from '@HostShell/components/Settings/HostSettingsPlaceholder';

interface DynamicViewRendererProps {
  viewId: string;
  suiteId?: string;
  sharedProps?: Record<string, unknown>;
}

/**
 * First-party host views — rendered inline without the plugin lookup so they
 * always work even before any plugin registers (Marketplace, Settings, etc.).
 */
const LOCAL_HOST_VIEWS: Record<string, React.ComponentType<any>> = {
  marketplace: TemplateHubView,
  'template-hub': TemplateHubView,
  'agency-configurator': AgencyConfiguratorView,
  'global-settings': GlobalSettingsView,
  integrations: IntegrationsView,
  'agency-builder': AgencyBuilderView,
  'all-users': AllUsersView,
  dashboard: DashboardView,
  'dashboard-view': DashboardView,
};

const IFRAME_FALLBACK_ENABLED = process.env.NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK === '1';

/**
 * DynamicViewRenderer
 *
 * Resolution order:
 *   1. LOCAL_HOST_VIEWS  — first-party screens hardcoded in the host shell
 *   2. RegistryViewRenderer — does its own tolerant lookup against
 *      BridgeRegistry across kebab/PascalCase/Suite-default-view variants
 *   3. iframe fallback — only when NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1
 */
export const DynamicViewRenderer: React.FC<DynamicViewRendererProps> = ({ viewId, suiteId, sharedProps }) => {
  const [, setTick] = useState(0);
  useEffect(() => BridgeRegistry.subscribe(() => setTick(t => t + 1)), []);

  const LocalView = LOCAL_HOST_VIEWS[viewId];
  if (LocalView) {
    return <LocalView />;
  }

  if (IFRAME_FALLBACK_ENABLED && !BridgeRegistry.resolve(viewId)) {
    return <IFrameViewRenderer viewId={viewId} />;
  }

  return <RegistryViewRenderer viewId={viewId} suiteId={suiteId} sharedProps={sharedProps} />;
};
