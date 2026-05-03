import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Auth
const LoginView = dynamic(() => import('@CRMShell/components/Auth/CRMLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@CRMShell/components/Auth/CRMSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@CRMShell/components/Auth/CRMWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// Shell
const BridgeControlView = dynamic(() => import('@CRMShell/components/BridgeControl/CRMBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@CRMShell/components/CRMModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@CRMShell/components/TemplateHub/CRMTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// Modals
const GlobalTasksModal = dynamic(() => import('@CRMShell/components/Modals/CRMGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@CRMShell/components/Modals/CRMInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@CRMShell/components/Modals/CRMNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// Settings
const SettingsView = dynamic(() => import('@CRMShell/components/Settings/CRMSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));

// Shared
const EditableText = dynamic(() => import('@CRMShell/components/design/CRMEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@CRMShell/components/shared/CRMSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const TopBar = dynamic(() => import('@CRMShell/components/shared/CRMTopBar').then(mod => mod.CRMTopBar as ComponentType<any>));

// Renderer
const DynamicViewRenderer = dynamic(() => import('@CRMShell/Renderer/CRMDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@CRMShell/Renderer/CRMSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

const CRMLeadManagementView = dynamic(() => import('@CRMShell/CRMTemplates/Leads/CRMLeadManagementView') as any);

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
  CRMLeadManagementView,
  'crm-dashboard': CRMLeadManagementView,
  'leads': CRMLeadManagementView,
  'LeadManagementView': CRMLeadManagementView,
};

export type WidgetName = string;
export type ViewName = string;
