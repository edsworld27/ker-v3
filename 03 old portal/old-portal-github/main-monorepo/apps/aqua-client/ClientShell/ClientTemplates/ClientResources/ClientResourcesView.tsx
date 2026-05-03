'use client';
import React from 'react';
import {
  Bot,
  BookOpen,
  Globe,
  TrendingUp,
  Briefcase,
  Settings,
  Leaf,
  Box,
  UploadCloud,
  Edit3,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Page, PageHeader, Section, Card, Button, Badge } from '@aqua/bridge/ui/kit';

const AI_ASSISTANTS = [
  { id: 'sales-ai',     label: 'Sales AI',       desc: 'Your personal sales coach and strategist.',        color: '#10b981', status: 'Coming Soon' },
  { id: 'ops-ai',       label: 'Operations AI',  desc: 'Streamline processes and manage your business.',   color: '#6366f1', status: 'Coming Soon' },
  { id: 'copy-ai',      label: 'Copy AI',        desc: 'Write high-converting content and messaging.',     color: '#f59e0b', status: 'Coming Soon' },
  { id: 'strategy-ai',  label: 'Strategy AI',    desc: 'Big-picture thinking and business development.',   color: '#8b5cf6', status: 'Coming Soon' },
];

const SETUP_GUIDES = [
  { id: 'company-profile', icon: Globe,      color: '#6366f1', label: 'Company Profile',     desc: 'Build your brand presence online.' },
  { id: 'online-setup',    icon: Settings,   color: '#3b82f6', label: 'Online Setup',         desc: 'Get your digital infrastructure right.' },
  { id: 'aqua-acquisition',icon: TrendingUp, color: '#10b981', label: 'Aqua Acquisition',     desc: 'Client acquisition system and strategy.' },
  { id: 'super-sales',     icon: Briefcase,  color: '#f59e0b', label: 'Super Sales',          desc: 'The complete Aqua sales methodology.' },
  { id: 'business-os',     icon: Bot,        color: '#8b5cf6', label: 'Business OS Tutorial', desc: 'How to run your business like a system.' },
  { id: 'operations',      icon: Settings,   color: '#06b6d4', label: 'Operations',           desc: 'Daily operations and team management.' },
  { id: 'sustainability',  icon: Leaf,       color: '#14b8a6', label: 'Sustainability',       desc: 'Building a business that lasts.' },
];

export const ClientResourcesView: React.FC = () => (
  <Page>
    <PageHeader
      eyebrow="Client portal"
      title="Resources"
      subtitle="Preset library — setup guides, AI assistants, and the Founders Fortune integration."
      actions={
        <Button variant="primary" icon={UploadCloud}>
          Add resource
        </Button>
      }
    />

    <div className="space-y-8">
      <Section
        title="Setup guides & modules"
        description="Curated playbooks shared with every client."
        actions={<BookOpen className="w-4 h-4 text-slate-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SETUP_GUIDES.map(guide => {
            const Icon = guide.icon;
            return (
              <Card key={guide.id} padding="md" interactive className="group">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${guide.color}15`, border: `1px solid ${guide.color}33` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: guide.color }} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400" aria-label="Preview">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-md bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center justify-center text-slate-400" aria-label="Edit">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{guide.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{guide.desc}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        title="AI assistants"
        description="Configurable LLM helpers gated by entitlement."
        actions={<Badge tone="success">Active roster</Badge>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {AI_ASSISTANTS.map(ai => (
            <Card key={ai.id} padding="md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${ai.color}15`, border: `1px solid ${ai.color}33` }}
                  >
                    <Bot className="w-4 h-4" style={{ color: ai.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">{ai.label}</h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{ai.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="neutral">{ai.status}</Badge>
                  <button className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400" aria-label="More">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Card padding="lg" className="border-amber-500/20 bg-amber-500/[0.04]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-white">Founders Fortune</h3>
                <Badge tone="warning">Thank-you gift</Badge>
              </div>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Edward&apos;s personal development app — gifted to every Aqua client. Build the mindset, habits, and frameworks of a high-performance founder.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit integration</Button>
        </div>
      </Card>
    </div>
  </Page>
);

export default ClientResourcesView;
