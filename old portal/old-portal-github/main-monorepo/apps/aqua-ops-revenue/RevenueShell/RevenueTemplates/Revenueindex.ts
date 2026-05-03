import { BridgeRegistry } from '@aqua/bridge/registry';

import { SalesSuiteRegistry } from './SalesSuite/registry';
import {
  SalesHubOverview,
  SalesPipelineView,
  SalesCalendarView,
  CrmInboxWidget,
  ProposalsWidget,
  LeadTimelineWidget,
} from './SalesSuite';

import { MarketingSuiteRegistry } from './MarketingSuite/registry';
import {
  MarketingOverview,
  CampaignList,
  ContentCalendar,
  LeadFunnel,
  ChannelPerformance,
  EmailMetrics,
  SocialEngagement,
} from './MarketingSuite';

export async function registerRevenueApp() {
  console.log('[AQUA Revenue] Registering Standalone Revenue App...');

  // Register Sales + Marketing suite metadata for sidebar grouping.
  BridgeRegistry.registerSuite(SalesSuiteRegistry);
  BridgeRegistry.registerSuite(MarketingSuiteRegistry);

  // Bind concrete components against canonical view-ids.
  BridgeRegistry.registerAll({
    'sales-hub-overview': SalesHubOverview,
    'sales-pipeline':     SalesPipelineView,
    'sales-calendar':     SalesCalendarView,
    'crm-inbox':          CrmInboxWidget,
    'proposals':          ProposalsWidget,
    'lead-timeline':      LeadTimelineWidget,

    'marketing-overview':   MarketingOverview,
    'campaigns':            CampaignList,
    'content-calendar':     ContentCalendar,
    'lead-funnel':          LeadFunnel,
    'channel-performance':  ChannelPerformance,
    'email-metrics':        EmailMetrics,
    'social-engagement':    SocialEngagement,
  });
}

export {
  SalesSuiteRegistry,
  MarketingSuiteRegistry,
};
