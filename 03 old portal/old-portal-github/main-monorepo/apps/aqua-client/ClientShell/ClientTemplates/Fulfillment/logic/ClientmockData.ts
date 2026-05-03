import { Layers, Clock, AlertTriangle, Zap } from 'lucide-react';

export const PRODUCTION_QUEUE = [
  { task: 'Homepage Hero Redesign', client: 'Acme Corp', assignee: 'Sarah', status: 'In Review', priority: 'High' },
  { task: 'Stripe Payment Integration', client: 'Global Tech', assignee: 'John', status: 'Blocked', priority: 'High' },
  { task: 'Brand Guidelines PDF', client: 'Nova Studio', assignee: 'Sarah', status: 'In Progress', priority: 'Medium' }
];

export const FULFILLMENT_STATS = [
  { label: 'Active Projects', value: '12', status: 'SCALING', icon: Layers, color: 'text-indigo-400' },
  { label: 'In Revision', value: '4', status: 'PENDING', icon: Clock, color: 'text-blue-400' },
  { label: 'Blocked Items', value: '1', status: 'CRITICAL', icon: AlertTriangle, color: 'text-rose-400' },
  { label: 'Sprint Velocity', value: '94%', status: 'BULLISH', icon: Zap, color: 'text-amber-400' }
];

export const PIPELINE_NODES = [
  { node: 'Production', value: 92 },
  { node: 'Staging', value: 95 },
  { node: 'Edge Cache', value: 98 }
];

export const THROUGHPUT_DATA = [40, 70, 45, 90, 65, 80, 50, 95, 60, 85];
