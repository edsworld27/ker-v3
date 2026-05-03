import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Auth
const LoginView = dynamic(() => import('@FinanceShell/components/Auth/FinanceLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@FinanceShell/components/Auth/FinanceSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@FinanceShell/components/Auth/FinanceWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// Shell
const BridgeControlView = dynamic(() => import('@FinanceShell/components/BridgeControl/FinanceBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@FinanceShell/components/FinanceModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@FinanceShell/components/TemplateHub/FinanceTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// Modals
const GlobalTasksModal = dynamic(() => import('@FinanceShell/components/Modals/FinanceGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@FinanceShell/components/Modals/FinanceInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@FinanceShell/components/Modals/FinanceNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// Settings
const SettingsView = dynamic(() => import('@FinanceShell/components/Settings/FinanceSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));

// Shared
const EditableText = dynamic(() => import('@FinanceShell/components/design/FinanceEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@FinanceShell/components/shared/FinanceSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const TopBar = dynamic(() => import('@FinanceShell/components/shared/FinanceTopBar').then(mod => mod.FinanceTopBar as ComponentType<any>));

// Renderer
const DynamicViewRenderer = dynamic(() => import('@FinanceShell/Renderer/FinanceDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@FinanceShell/Renderer/FinanceSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

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
