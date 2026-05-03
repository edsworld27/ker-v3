import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAutoSync } from '@ClientShell/hooks/ClientuseAutoSync';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Zap,
  LayoutDashboard,
  Megaphone,
  Mail
} from 'lucide-react';
import { Deal } from './types';
import { MarketingCampaign, PressRelease, SocialMediaPost } from './types/marketing';
import { CommissionRecord, PrizeTier } from '@ClientShell/bridge/types';
import {
  initialDeals, 
  initialCommissionRecords, 
  initialCommissionPrizes,
  initialMarketingCampaigns, 
  initialPressReleases, 
  initialSocialPosts, 
  initialMailingLists, 
  initialAffiliateAccounts, 
  initialMarketingLeads, 
  initialMarketingPipelines
} from './logic/ClientmockData';

/**
 * RevenueCommandContext — Unified Growth & Velocity Logic
 * Orchestrates both Sales (Velocity) and Marketing (Growth) state for a unified command experience.
 */

function useRevenueLogicInternal() {
  const context = useAppContext();
  const { 
    currentUser, 
    portalView, 
    handleViewChange, 
    addLog, 
    sendNotification, 
    portalMode,
    setDeals: setDealsBridge,
    setAffiliateAccounts: setAffiliateAccountsBridge,
    enabledSuiteIds 
  } = context;

  const isDemo = portalMode === 'demo';
  const isSalesActive = enabledSuiteIds.includes('sales_suite');
  const isMarketingActive = enabledSuiteIds.includes('marketing_suite');

  // --- 📈 Velocity State (Sales) ---
  const [deals, setDeals] = useState<Deal[]>(isDemo ? initialDeals as any : []);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>(isDemo ? initialCommissionRecords as any : []);
  const [commissionPrizes, setCommissionPrizes] = useState<PrizeTier[]>(isDemo ? initialCommissionPrizes as any : []);
  const [salesPipelines, setSalesPipelines] = useState<any[]>([]);
  const [salesLeads, setSalesLeads] = useState<any[]>([]);
  const [activeProposal, setActiveProposal] = useState<any>(null);

  // --- 🚀 Growth State (Marketing) ---
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(isDemo ? initialMarketingCampaigns as any : []);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>(isDemo ? initialPressReleases as any : []);
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>(isDemo ? initialSocialPosts : []);
  const [mailingLists, setMailingLists] = useState<any[]>(isDemo ? initialMailingLists : []);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [brandAssets, setBrandAssets] = useState<any[]>([]);
  const [affiliateAccounts, setAffiliateAccounts] = useState<any[]>(isDemo ? initialAffiliateAccounts : []);
  const [marketingLeads, setMarketingLeads] = useState<any[]>(isDemo ? initialMarketingLeads : []);
  const [marketingPipelines, setMarketingPipelines] = useState<any[]>(isDemo ? initialMarketingPipelines : []);

  // --- 📡 Bridge Sync Logic ---
  useEffect(() => {
    if (isSalesActive) setDealsBridge(deals);
  }, [isSalesActive, deals, setDealsBridge]);

  useEffect(() => {
    if (isMarketingActive) {
      setAffiliateAccountsBridge(affiliateAccounts);
    } else {
      setAffiliateAccountsBridge([]);
    }
  }, [isMarketingActive, affiliateAccounts, setAffiliateAccountsBridge]);

  // --- 🛠️ Unified Handlers ---
  const handleUpdateDealStatus = (dealId: string, stage: Deal['stage']) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d));
    addLog('Revenue', `Velocity Node Update: ${dealId} to ${stage}`, 'action');
    if (stage === 'Won' && currentUser) {
      sendNotification(currentUser.id, 'Deal Closed!', `Congratulations on closing deal ${dealId}`, 'success');
    }
  };

  const handleCreateDeal = (deal: Partial<Deal>) => {
    const newDeal = { id: `deal-${Date.now()}`, ...deal, stage: 'Lead', createdAt: new Date().toISOString() } as Deal;
    setDeals(prev => [newDeal, ...prev]);
    addLog('Revenue', `New Velocity Node Created: ${deal.name}`, 'action');
  };

  const handleCreateCampaign = (campaign: Omit<MarketingCampaign, 'id' | 'roi' | 'spendToDate'>) => {
    const newCampaign: MarketingCampaign = { ...campaign, id: `camp-${Date.now()}`, spendToDate: 0, roi: 0, conversions: 0 };
    setMarketingCampaigns(prev => [newCampaign, ...prev]);
    addLog('Revenue', `New Growth Campaign Initialized: ${campaign.name}`, 'action');
  };

  // --- 🗺️ Unified Navigation ---
  const navItems = [
    // 🔱 Velocity Hub
    { id: 'sales-hub', label: 'Revenue Hub', icon: LayoutDashboard, view: 'sales-hub', active: portalView === 'sales-hub', onClick: () => handleViewChange('sales-hub') },
    { id: 'sales-pipeline', label: 'Velocity Pipeline', icon: TrendingUp, view: 'sales-pipeline', active: portalView === 'sales-pipeline', onClick: () => handleViewChange('sales-pipeline') },
    { id: 'crm-inbox', label: 'Signal Inbox', icon: MessageSquare, view: 'crm-inbox', active: portalView === 'crm-inbox', onClick: () => handleViewChange('crm-inbox') },
    { id: 'sales-proposals', label: 'Protocol Vault', icon: FileText, view: 'sales-proposals', active: portalView === 'sales-proposals', onClick: () => handleViewChange('sales-proposals') },
    
    // 🧬 Growth Hub
    { id: 'marketing-ads', label: 'Growth Ads', icon: Megaphone, view: 'marketing-ads', active: portalView === 'marketing-ads', onClick: () => handleViewChange('marketing-ads') },
    { id: 'marketing-mailing', label: 'Pulse Mailing', icon: Mail, view: 'marketing-mailing', active: portalView === 'marketing-mailing', onClick: () => handleViewChange('marketing-mailing') },
    { id: 'marketing-leads', label: 'Lead Scraper', icon: Zap, view: 'marketing-leads', active: portalView === 'marketing-leads', onClick: () => handleViewChange('marketing-leads') },
    
    // 📅 Temporal
    { id: 'sales-calendar', label: 'Chronos Hub', icon: Calendar, view: 'sales-calendar', active: portalView === 'sales-calendar', onClick: () => handleViewChange('sales-calendar') },
  ];

  // --- 🛰️ Auto-Sync Layer ---
  useAutoSync('revenue_unified_data', {
    deals,
    commissionRecords,
    marketingCampaigns,
    mailingLists,
    affiliateAccounts,
    marketingLeads
  });

  return {
    ...context,
    // State
    deals, setDeals,
    commissionRecords, setCommissionRecords,
    commissionPrizes, setCommissionPrizes,
    salesPipelines, setSalesPipelines,
    salesLeads, setSalesLeads,
    activeProposal, setActiveProposal,
    marketingCampaigns, setMarketingCampaigns,
    pressReleases, setPressReleases,
    socialPosts, setSocialPosts,
    mailingLists, setMailingLists,
    influencers, setInfluencers,
    brandAssets, setBrandAssets,
    affiliateAccounts, setAffiliateAccounts,
    marketingLeads, setMarketingLeads,
    marketingPipelines, setMarketingPipelines,
    // Handlers
    handleUpdateDealStatus,
    handleCreateDeal,
    handleCreateCampaign,
    navItems,
    portalView,
    handleViewChange
  };
}

type RevenueContextType = ReturnType<typeof useRevenueLogicInternal>;
const RevenueContext = createContext<RevenueContextType | undefined>(undefined);

export const RevenueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useRevenueLogicInternal();
  return <RevenueContext.Provider value={value}>{children}</RevenueContext.Provider>;
};

const noopRevenue: any = new Proxy({}, {
  get(_t, prop) {
    if (typeof prop === 'string' && (prop.startsWith('handle') || prop.startsWith('set') || prop.startsWith('add') || prop.startsWith('update') || prop.startsWith('delete'))) return () => {};
    return undefined;
  },
});

export const useRevenueContext = () => {
  const context = useContext(RevenueContext);
  return context ?? noopRevenue;
};
