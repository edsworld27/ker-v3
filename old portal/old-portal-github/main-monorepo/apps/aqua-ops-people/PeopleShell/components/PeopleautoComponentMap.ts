import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Auth
const LoginView = dynamic(() => import('@PeopleShell/components/Auth/PeopleLoginView').then(mod => mod.LoginView as ComponentType<any>));
const SecurityCheckView = dynamic(() => import('@PeopleShell/components/Auth/PeopleSecurityCheckView').then(mod => mod.SecurityCheckView as ComponentType<any>));
const WelcomeScreen = dynamic(() => import('@PeopleShell/components/Auth/PeopleWelcomeScreen').then(mod => mod.WelcomeScreen as ComponentType<any>));

// Shell
const BridgeControlView = dynamic(() => import('@PeopleShell/components/BridgeControl/PeopleBridgeControlView').then(mod => mod.BridgeControlView as ComponentType<any>));
const ModalManager = dynamic(() => import('@PeopleShell/components/PeopleModalManager').then(mod => mod.ModalManager as ComponentType<any>));
const TemplateHubView = dynamic(() => import('@PeopleShell/components/TemplateHub/PeopleTemplateHubView').then(mod => mod.TemplateHubView as ComponentType<any>));

// Modals
const GlobalTasksModal = dynamic(() => import('@PeopleShell/components/Modals/PeopleGlobalTasksModal').then(mod => mod.GlobalTasksModal as ComponentType<any>));
const InboxModal = dynamic(() => import('@PeopleShell/components/Modals/PeopleInboxModal').then(mod => mod.InboxModal as ComponentType<any>));
const NotificationsModal = dynamic(() => import('@PeopleShell/components/Modals/PeopleNotificationsModal').then(mod => mod.NotificationsModal as ComponentType<any>));

// Settings
const SettingsView = dynamic(() => import('@PeopleShell/components/Settings/PeopleSettingsPlaceholder').then(mod => mod.AgencyConfiguratorView as ComponentType<any>));

// Shared
const EditableText = dynamic(() => import('@PeopleShell/components/design/PeopleEditableText').then(mod => mod.EditableText as ComponentType<any>));
const SubNavBar = dynamic(() => import('@PeopleShell/components/shared/PeopleSubNavBar').then(mod => mod.SubNavBar as ComponentType<any>));
const TopBar = dynamic(() => import('@PeopleShell/components/shared/PeopleTopBar').then(mod => mod.PeopleTopBar as ComponentType<any>));

// Renderer
const DynamicViewRenderer = dynamic(() => import('@PeopleShell/Renderer/PeopleDynamicViewRenderer').then(mod => mod.DynamicViewRenderer as ComponentType<any>));
const SuiteRouter = dynamic(() => import('@PeopleShell/Renderer/PeopleSuiteRouter').then(mod => mod.SuiteRouter as ComponentType<any>));

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
