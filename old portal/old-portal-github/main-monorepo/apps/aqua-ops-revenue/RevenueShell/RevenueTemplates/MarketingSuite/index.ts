/**
 * MarketingSuite — Revenue Hub Marketing widgets (Phase 3.2).
 *
 * Barrel exports the suite registry plus each widget. Widget-level UI
 * variable maps are also re-exported for downstream theming overrides.
 */
export { MarketingSuiteRegistry } from './registry';
export { default } from './registry';

export { MarketingOverview, marketingOverviewUI } from './MarketingOverview';
export { CampaignList, campaignListUI } from './CampaignList';
export { ContentCalendar, contentCalendarUI, CONTENT_TYPE_COLORS } from './ContentCalendar';
export { LeadFunnel, leadFunnelUI, STAGE_COLORS } from './LeadFunnel';
export { ChannelPerformance, channelPerformanceUI, CHANNEL_COLOR } from './ChannelPerformance';
export { EmailMetrics, emailMetricsUI } from './EmailMetrics';
export { SocialEngagement, socialEngagementUI, PLATFORM_COLORS } from './SocialEngagement';
