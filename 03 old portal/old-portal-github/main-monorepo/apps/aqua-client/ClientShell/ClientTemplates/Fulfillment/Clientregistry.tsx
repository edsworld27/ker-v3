import { lazy } from 'react';
import { 
  Package, Boxes, Layers, 
  Target, MessageSquare, Briefcase,
  ClipboardList, Layout, Calendar, MessageCircle
} from 'lucide-react';
import { SuiteTemplate } from '@ClientShell/bridge/types';
const FulfillmentView = lazy(() => import('./ClientFulfillmentView').then(m => ({ default: m.FulfillmentView })));
const FulfillmentOverview = lazy(() => import('./views/ClientFulfillmentOverview').then(m => ({ default: m.FulfillmentOverview })));
import { FulfillmentSuiteSetup } from './Clientsetup';

// Component & Widget Imports
const FulfillmentIncubator = lazy(() => import('./components/ClientFulfillmentIncubator').then(m => ({ default: m.FulfillmentIncubator })));
const FulfillmentAds = lazy(() => import('./components/ClientFulfillmentAds').then(m => ({ default: m.FulfillmentAds })));
const FulfillmentSocial = lazy(() => import('./components/ClientFulfillmentSocial').then(m => ({ default: m.FulfillmentSocial })));
const ProjectListWidget = lazy(() => import('./components/ProjectListWidget/ClientProjectListWidget').then(m => ({ default: m.ProjectListWidget })));
const TaskListWidget = lazy(() => import('./components/TaskListWidget/ClientTaskListWidget').then(m => ({ default: m.TaskListWidget })));
const TaskBoardWidget = lazy(() => import('./components/TaskBoardWidget/ClientTaskBoardWidget').then(m => ({ default: m.TaskBoardWidget })));
const ProjectTimeline = lazy(() => import('./components/ProjectTimeline/ClientProjectTimeline').then(m => ({ default: m.ProjectTimeline })));
const ProjectChat = lazy(() => import('./components/ProjectChat/ClientProjectChat').then(m => ({ default: m.ProjectChat })));

export const FulfillmentRegistry: SuiteTemplate = {
  id: 'fulfillment-view',
  label: 'Fulfillment Hub',
  icon: Package,
  component: FulfillmentView,
  setup: FulfillmentSuiteSetup,
  section: 'Operations Hub',
  requiredSuites: ['hr-suite', 'project-suite'], 
  subItems: [
    { 
      id: 'ff-production', 
      label: 'Production Queue',   
      icon: Boxes,   
      view: 'ff-production',
      component: FulfillmentOverview
    },
    { 
      id: 'ff-projects', 
      label: 'Active Projects', 
      icon: Briefcase, 
      view: 'ff-projects', 
      component: ProjectListWidget
    },
    { 
      id: 'ff-tasks', 
      label: 'Task List', 
      icon: ClipboardList, 
      view: 'ff-tasks', 
      component: TaskListWidget
    },
    { 
      id: 'ff-board', 
      label: 'Kanban Board', 
      icon: Layout, 
      view: 'ff-board', 
      component: TaskBoardWidget
    },
    { 
      id: 'ff-timeline', 
      label: 'Project Timeline', 
      icon: Calendar, 
      view: 'ff-timeline', 
      component: ProjectTimeline
    },
    { 
      id: 'ff-chat', 
      label: 'Project Chat', 
      icon: MessageCircle, 
      view: 'ff-chat', 
      component: ProjectChat
    },
    { 
      id: 'ff-incubator', 
      label: 'Portal Incubator', 
      icon: Layers, 
      view: 'ff-incubator', 
      component: FulfillmentIncubator 
    },
    { 
      id: 'ff-ads', 
      label: 'Ad Operations', 
      icon: Target, 
      view: 'ff-ads', 
      component: FulfillmentAds 
    },
    { 
      id: 'ff-social', 
      label: 'Social Scheduler', 
      icon: MessageSquare, 
      view: 'ff-social', 
      component: FulfillmentSocial 
    }
  ]
};

export default FulfillmentRegistry;
