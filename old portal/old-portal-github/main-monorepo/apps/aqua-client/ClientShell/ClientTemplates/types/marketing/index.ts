export interface MarketingCampaign {
  id: string;
  name: string;
  title?: string;
  status: string;
  budget?: number;
  spendToDate?: number;
  roi?: number;
  conversions?: number;
  startDate?: string;
  endDate?: string;
}

export interface PressRelease {
  id: string;
  title: string;
  content?: string;
  status: string;
  publishDate?: string;
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  status: string;
  scheduledAt?: string;
}
