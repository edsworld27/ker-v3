import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Auth
const LoginView = dynamic(() => import('@OpsHubShell/components/Auth/OpsHubLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@OpsHubShell/components/Auth/OpsHubSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@OpsHubShell/components/Auth/OpsHubWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// Shell
const BridgeControlView = dynamic(() => import('@OpsHubShell/components/BridgeControl/OpsHubBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@OpsHubShell/components/OpsHubModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@OpsHubShell/components/TemplateHub/OpsHubTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// Modals
const GlobalTasksModal = dynamic(() => import('@OpsHubShell/components/Modals/OpsHubGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@OpsHubShell/components/Modals/OpsHubInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@OpsHubShell/components/Modals/OpsHubNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// Settings
const SettingsView = dynamic(() => import('@OpsHubShell/components/Settings/OpsHubSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));

// Shared
const EditableText = dynamic(() => import('@OpsHubShell/components/design/OpsHubEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@OpsHubShell/components/shared/OpsHubSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const TopBar = dynamic(() => import('@OpsHubShell/components/shared/OpsHubTopBar').then(mod => mod.OpsHubTopBar as ComponentType<any>));

// Renderer
const DynamicViewRenderer = dynamic(() => import('@OpsHubShell/Renderer/OpsHubDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@OpsHubShell/Renderer/OpsHubSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

export const autoComponentMap: Record<string, ComponentType<any>> = {
  LoginView, 'login': LoginView, 'login-view': LoginView,
  SecurityCheckView, 'security-check': SecurityCheckView,
  WelcomeScreen, 'welcome-screen': WelcomeScreen,
  BridgeControlView, 'bridge-control': BridgeControlView,
  ModalManager, 'modal-manager': ModalManager,
  TemplateHubView, 'template-hub': TemplateHubView,
  GlobalTasksModal, 'global-tasks-modal': GlobalTasksModal,
  InboxModal, 'inbox-modal': InboxModal,
  NotificationsModal, 'notifications-modal': NotificationsModal,
  SettingsView, 'settings': SettingsView,
  EditableText, 'editable-text': EditableText,
  SubNavBar, 'sub-nav-bar': SubNavBar,
  TopBar, 'top-bar': TopBar,
  DynamicViewRenderer, 'dynamic-view-renderer': DynamicViewRenderer,
  SuiteRouter, 'suite-router': SuiteRouter,
};

export type WidgetName = string;
export type ViewName = string;
