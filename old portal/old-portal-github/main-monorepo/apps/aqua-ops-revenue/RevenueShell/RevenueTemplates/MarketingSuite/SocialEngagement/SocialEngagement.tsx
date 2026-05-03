'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Heart, Share2, Users } from 'lucide-react';
import { Page, PageHeader, Card, Badge } from '@aqua/bridge/ui/kit';

type Platform = 'Instagram' | 'LinkedIn' | 'Twitter' | 'TikTok';

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: '#ec4899',
  LinkedIn: '#0ea5e9',
  Twitter: '#38bdf8',
  TikTok: '#a855f7',
};

interface PlatformCard {
  platform: Platform;
  followers: number;
  growthPct: number;
  engagementPct: number;
  topPost: { text: string; engagements: number };
}

interface RecentPost {
  id: string;
  platform: Platform;
  text: string;
  engagements: number;
  postedAgo: string;
}

const PLATFORMS: readonly PlatformCard[] = [
  { platform: 'Instagram', followers: 84_320, growthPct: 4.2,  engagementPct: 5.8, topPost: { text: 'Behind-the-scenes carousel: how we redesigned client onboarding from scratch.', engagements: 9_412 } },
  { platform: 'LinkedIn',  followers: 32_180, growthPct: 7.6,  engagementPct: 3.4, topPost: { text: 'The hidden cost of context-switching for agency operators (2,000-word essay).', engagements: 4_628 } },
  { platform: 'Twitter',   followers: 21_540, growthPct: -1.2, engagementPct: 2.1, topPost: { text: '"Stop building dashboards no one opens." — thread on actionable analytics.', engagements: 3_104 } },
  { platform: 'TikTok',    followers: 56_200, growthPct: 12.4, engagementPct: 8.6, topPost: { text: 'Founder pov: walking through a brand audit in 60 seconds.', engagements: 18_204 } },
];

const RECENT_POSTS: readonly RecentPost[] = [
  { id: 'p1', platform: 'TikTok',    text: 'Founder pov: walking through a brand audit in 60 seconds.',     engagements: 18_204, postedAgo: '6h' },
  { id: 'p2', platform: 'Instagram', text: 'Carousel: 5 client onboarding mistakes we stopped making.',     engagements:  9_412, postedAgo: '1d' },
  { id: 'p3', platform: 'LinkedIn',  text: 'The hidden cost of context-switching for agency operators.',    engagements:  4_628, postedAgo: '2d' },
  { id: 'p4', platform: 'Twitter',   text: '"Stop building dashboards no one opens." — thread.',            engagements:  3_104, postedAgo: '3d' },
  { id: 'p5', platform: 'Instagram', text: 'Reel: a day in the life of an account manager.',                engagements:  2_880, postedAgo: '4d' },
  { id: 'p6', platform: 'LinkedIn',  text: 'Hiring update: we doubled the design team in Q1.',              engagements:  1_842, postedAgo: '5d' },
];

const formatNumber = (n: number): string => new Intl.NumberFormat('en-US').format(n);

export const SocialEngagement: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Marketing"
      title="Social engagement"
      subtitle="Follower growth, engagement, and top posts across platforms."
      actions={
        <Badge tone="indigo">
          <Share2 className="w-3 h-3 mr-1" />
          Last 30 days
        </Badge>
      }
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {PLATFORMS.map(p => {
        const isUp = p.growthPct >= 0;
        const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
        const trendColor = isUp ? 'text-emerald-400' : 'text-rose-400';
        return (
          <Card key={p.platform} padding="md">
            <div className="flex items-center justify-between mb-4">
              <span
                className="inline-flex items-center px-2 h-5 rounded-md text-[11px] font-medium text-white"
                style={{ backgroundColor: PLATFORM_COLORS[p.platform] }}
              >
                {p.platform}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                {isUp ? '+' : ''}{p.growthPct.toFixed(1)}%
                <TrendIcon className="w-3 h-3" />
              </span>
            </div>

            <div className="text-2xl font-semibold text-white tabular-nums">{formatNumber(p.followers)}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mt-1 inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              Followers
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs">
              <span className="text-slate-400">Engagement</span>
              <span className="text-white font-medium tabular-nums">{p.engagementPct.toFixed(1)}%</span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">Top post</div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{p.topPost.text}</p>
              <div className="text-[11px] text-slate-500 mt-1.5 inline-flex items-center gap-1 tabular-nums">
                <Heart className="w-3 h-3" />
                {formatNumber(p.topPost.engagements)} engagements
              </div>
            </div>
          </Card>
        );
      })}
    </div>

    <Card padding="none">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Recent posts</h3>
      </div>
      <ul className="divide-y divide-white/5">
        {RECENT_POSTS.map(post => (
          <li key={post.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold text-white shrink-0"
              style={{ backgroundColor: PLATFORM_COLORS[post.platform] }}
            >
              {post.platform.charAt(0)}
            </span>
            <span className="flex-1 text-sm text-slate-200 truncate">{post.text}</span>
            <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
              {formatNumber(post.engagements)} eng · {post.postedAgo}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  </Page>
);
