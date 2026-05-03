import React from 'react';
import { Search, History, Boxes, Truck, BarChart3, Zap } from 'lucide-react';
import {
  Page,
  PageHeader,
  Card,
  KpiCard,
  Button,
  Badge,
  Avatar,
  EmptyState,
} from '@aqua/bridge/ui/kit';
import { useFulfillmentLogic } from '../logic/ClientuseFulfillmentLogic';

interface QueueItem {
  task: string;
  client: string;
  assignee: string;
  status: 'Blocked' | 'In Review' | 'In Progress' | string;
}

const STATUS_TONE = (status: string) => {
  if (status === 'Blocked') return 'danger' as const;
  if (status === 'In Review') return 'indigo' as const;
  return 'success' as const;
};

export const FulfillmentOverview: React.FC = () => {
  const { queue, stats, pipelines, throughput, handleInitializeSprint } = useFulfillmentLogic();

  return (
    <Page>
      <PageHeader
        eyebrow="Fulfillment"
        title="Production hub"
        subtitle="Operations core — production queue and delivery velocity."
        actions={
          <Button variant="primary" icon={Zap} onClick={handleInitializeSprint}>
            Initialize sprint
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => (
          <KpiCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            delta={stat.status}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white inline-flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-300" />
              Live production queue
            </h3>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" icon={Search} aria-label="Search" />
              <Button variant="ghost" size="sm" icon={History} aria-label="History" />
            </div>
          </div>

          {queue.length === 0 ? (
            <EmptyState title="Queue is empty" description="Spin up a new sprint to populate the production queue." />
          ) : (
            <ul className="space-y-2">
              {(queue as QueueItem[]).map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={item.assignee} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.task}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.client}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE(item.status)}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-3">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white inline-flex items-center gap-2 mb-4">
              <Truck className="w-4 h-4 text-blue-300" />
              Delivery pipelines
            </h3>
            <div className="space-y-3">
              {pipelines.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{p.node}</span>
                    <span className="text-slate-400 tabular-nums">{p.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${p.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-white inline-flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-indigo-300" />
              Throughput
            </h3>
            <div className="flex items-end gap-1 h-12">
              {throughput.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-500/30 hover:bg-indigo-500/50 rounded-t-sm transition-colors"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default FulfillmentOverview;
