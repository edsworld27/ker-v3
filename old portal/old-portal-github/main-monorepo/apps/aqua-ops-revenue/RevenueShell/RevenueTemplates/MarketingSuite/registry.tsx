import {
  BarChart3,
  Calendar,
  Filter,
  LayoutDashboard,
  Mail,
  Megaphone,
  Share2,
  Target,
} from 'lucide-react';
import type { SuiteTemplate } from '@aqua/bridge';
import { CampaignList } from './CampaignList';
import { ChannelPerformance } from './ChannelPerformance';
import { ContentCalendar } from './ContentCalendar';
import { EmailMetrics } from './EmailMetrics';
import { LeadFunnel } from './LeadFunnel';
import { MarketingOverview } from './MarketingOverview';
import { SocialEngagement } from './SocialEngagement';

/**
 * MarketingSuiteRegistry — Suite-level mini-registry registering all 7
 * marketing widgets as subItems for the Revenue Hub sidebar.
 *
 * Following the View Mini-Registry Pattern (dev-config.md § 8) and Suite
 * Architecture (§ 9). Registration into the global Bridge registry is the
 * orchestrator's job — this file only declares structure.
 */
export const MarketingSuiteRegistry: SuiteTemplate = {
  id: 'marketing-suite',
  label: 'Marketing',
  icon: Megaphone,
  section: 'Revenue Hub',
  category: 'Marketing',
  description: 'Top-of-funnel command centre: campaign tracking, content calendar, lead funnel, channel performance, email + social engagement metrics.',
  pricing: 'pro',
  defaultView: 'marketing-overview',
  configSchema: [
    { key: 'gaPropertyId', label: 'Google Analytics property ID', type: 'string',  placeholder: 'G-XXXXXXXXXX', secret: true },
    { key: 'mailgunApiKey', label: 'Mailgun API key',             type: 'string',  secret: true,  description: 'Required for Email Metrics widget.' },
    { key: 'autoCreateUTM', label: 'Auto-generate UTM params',    type: 'boolean', default: true },
    { key: 'channels',      label: 'Tracked channels',            type: 'multiselect', options: ['Organic Search', 'Paid Search', 'Paid Social', 'Email', 'Direct', 'Referral'], default: ['Organic Search', 'Paid Search', 'Email', 'Direct'] },
  ],
  subItems: [
    { id: 'marketing-overview', label: 'Overview',         icon: LayoutDashboard, view: 'marketing-overview',  component: MarketingOverview },
    { id: 'campaigns',          label: 'Campaigns',        icon: Target,          view: 'campaigns',           component: CampaignList },
    { id: 'content-calendar',   label: 'Content Calendar', icon: Calendar,        view: 'content-calendar',    component: ContentCalendar },
    { id: 'lead-funnel',        label: 'Lead Funnel',      icon: Filter,          view: 'lead-funnel',         component: LeadFunnel },
    { id: 'channel-performance',label: 'Channels',         icon: BarChart3,       view: 'channel-performance', component: ChannelPerformance },
    { id: 'email-metrics',      label: 'Email',            icon: Mail,            view: 'email-metrics',       component: EmailMetrics },
    { id: 'social-engagement',  label: 'Social',           icon: Share2,          view: 'social-engagement',   component: SocialEngagement },
  ],
};

export default MarketingSuiteRegistry;
