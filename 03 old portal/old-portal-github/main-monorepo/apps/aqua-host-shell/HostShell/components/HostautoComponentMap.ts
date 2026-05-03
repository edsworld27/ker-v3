/**
 * HOST SHELL COMPONENT MAP
 *
 * Only contains components that run directly IN the host shell.
 * Domain views (Client, CRM, Operations templates) are served by
 * their respective micro-apps via iframe — not included here.
 */

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// ── Auth (baked into shell for immediate availability) ──────────────────────
const LoginView = dynamic(() => import('@HostShell/components/Auth/HostLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@HostShell/components/Auth/HostSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@HostShell/components/Auth/HostWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// ── Shell Infrastructure ─────────────────────────────────────────────────────
const BridgeControlView = dynamic(() => import('@HostShell/components/BridgeControl/HostBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@HostShell/components/HostModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@HostShell/components/TemplateHub/HostTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// ── Modals ───────────────────────────────────────────────────────────────────
const GlobalTasksModal = dynamic(() => import('@HostShell/components/Modals/HostGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@HostShell/components/Modals/HostInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@HostShell/components/Modals/HostNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// ── Settings / Placeholders ──────────────────────────────────────────────────
const AgencyConfiguratorView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));
const GlobalSettingsView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.GlobalSettingsView as ComponentType<any>));
const IntegrationsView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.IntegrationsView as ComponentType<any>));
const AgencyBuilderView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.AgencyBuilderView as ComponentType<any>));
const AllUsersView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.AllUsersView as ComponentType<any>));
const DashboardView = dynamic(() => import('@HostShell/components/Settings/HostSettingsPlaceholder').then(mod => mod.DashboardView as ComponentType<any>));

// ── Shared UI ────────────────────────────────────────────────────────────────
const EditableText = dynamic(() => import('@HostShell/components/design/HostEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@HostShell/components/shared/HostSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const HostTopBar = dynamic(() => import('@HostShell/components/shared/HostTopBar').then(mod => mod.HostTopBar as ComponentType<any>));

// ── Renderer ─────────────────────────────────────────────────────────────────
const DynamicViewRenderer = dynamic(() => import('@HostShell/Renderer/HostDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@HostShell/Renderer/HostSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

// ── Optional shell hooks (no-op stubs) ───────────────────────────────────────
// HostFrame conditionally renders these via SmartRegistry. SmartRegistry's
// fallback returns a red "Component Not Found" banner instead of null when a
// key is missing, which defeated the inline `|| (() => null)` fallbacks in
// HostFrame.tsx. Registering harmless no-ops keeps the resolver happy without
// surfacing UI noise. Override by registering real components via the Bridge.
const NoopComponent: ComponentType<any> = () => null;
const AgencySetupView: ComponentType<any> = NoopComponent;
const DesignModeInspector: ComponentType<any> = NoopComponent;
const AgencyConfigurator: ComponentType<any> = NoopComponent;

export const autoComponentMap: Record<string, ComponentType<any>> = {
  // Auth
  LoginView,
  'login': LoginView,
  'login-view': LoginView,
  SecurityCheckView,
  'security-check': SecurityCheckView,
  WelcomeScreen,
  'welcome-screen': WelcomeScreen,

  // Shell
  BridgeControlView,
  'bridge-control': BridgeControlView,
  'bridge-control-view': BridgeControlView,
  ModalManager,
  'modal-manager': ModalManager,
  TemplateHubView,
  'template-hub': TemplateHubView,

  // Modals
  GlobalTasksModal,
  'global-tasks-modal': GlobalTasksModal,
  InboxModal,
  'inbox-modal': InboxModal,
  NotificationsModal,
  'notifications-modal': NotificationsModal,

  // Settings
  AgencyConfiguratorView,
  'agency-configurator': AgencyConfiguratorView,
  'agency-builder': AgencyBuilderView,
  AgencyBuilderView,
  GlobalSettingsView,
  'global-settings': GlobalSettingsView,
  IntegrationsView,
  'integrations': IntegrationsView,
  AllUsersView,
  'all-users': AllUsersView,
  DashboardView,
  'dashboard-view': DashboardView,

  // Shared
  EditableText,
  'editable-text': EditableText,
  SubNavBar,
  'sub-nav-bar': SubNavBar,
  HostTopBar,
  'top-bar': HostTopBar,

  // Renderer
  DynamicViewRenderer,
  'dynamic-view-renderer': DynamicViewRenderer,
  SuiteRouter,
  'suite-router': SuiteRouter,

  // Optional shell hooks (no-op until plugins register real components)
  AgencySetupView,
  'agency-setup-view': AgencySetupView,
  DesignModeInspector,
  'design-mode-inspector': DesignModeInspector,
  AgencyConfigurator,
};

export type WidgetName = string;
export type ViewName = string;
