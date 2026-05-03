import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Auth
const LoginView = dynamic(() => import('@RevenueShell/components/Auth/RevenueLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@RevenueShell/components/Auth/RevenueSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@RevenueShell/components/Auth/RevenueWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// Shell
const BridgeControlView = dynamic(() => import('@RevenueShell/components/BridgeControl/RevenueBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@RevenueShell/components/RevenueModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@RevenueShell/components/TemplateHub/RevenueTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// Modals
const GlobalTasksModal = dynamic(() => import('@RevenueShell/components/Modals/RevenueGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@RevenueShell/components/Modals/RevenueInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@RevenueShell/components/Modals/RevenueNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// Settings
const SettingsView = dynamic(() => import('@RevenueShell/components/Settings/RevenueSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));

// Shared
const EditableText = dynamic(() => import('@RevenueShell/components/design/RevenueEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@RevenueShell/components/shared/RevenueSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const TopBar = dynamic(() => import('@RevenueShell/components/shared/RevenueTopBar').then(mod => mod.RevenueTopBar as ComponentType<any>));

// Renderer
const DynamicViewRenderer = dynamic(() => import('@RevenueShell/Renderer/RevenueDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@RevenueShell/Renderer/RevenueSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

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
