import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../../context/AppContext';
import { DashboardWidget } from '../DashboardWidget';
import { Users, Activity, BarChart, FileText } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const dummyChartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

const dummyListData = [
  { id: 1, title: 'New User Registration', time: '2 mins ago', status: 'success' },
  { id: 2, title: 'Server CPU Spike', time: '15 mins ago', status: 'warning' },
  { id: 3, title: 'Database Backup Completed', time: '1 hour ago', status: 'success' },
  { id: 4, title: 'Failed Login Attempt', time: '2 hours ago', status: 'error' },
];

interface CustomPageViewProps {
  pageId: string;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({ pageId }) => {
  const { customPages } = useAppContext();
  const page = customPages.find(p => p.id === pageId);

  if (!page) {
    return (
      <div className="p-10 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-slate-500">The requested page does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <motion.div
      key={page.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">{page.title}</h2>
          <p className="text-slate-500">Custom dashboard view.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {page.widgets.map(widget => {
          if (widget.type === 'metric') {
            return (
              <DashboardWidget 
                key={widget.id}
                icon={Activity} 
                label={widget.title} 
                value="---" 
                trend="Live" 
                color="indigo" 
              />
            );
          }
          return null;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {page.widgets.map(widget => {
          if (widget.type !== 'metric') {
            return (
              <div key={widget.id} className={`glass-card p-8 rounded-3xl ${widget.size === 'full' ? 'lg:col-span-2' : ''}`}>
                <h3 className="text-xl font-medium mb-6">{widget.title}</h3>
                {widget.type === 'text' && (
                  <p className="text-slate-400">{widget.content || 'No content provided.'}</p>
                )}
                {widget.type === 'chart' && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dummyChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {widget.type === 'list' && (
                  <div className="space-y-3">
                    {dummyListData.map(item => (
                      <div key={item.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'success' ? 'bg-emerald-400' : 
                            item.status === 'warning' ? 'bg-amber-400' : 
                            'bg-red-400'
                          }`} />
                          <span className="text-sm font-medium text-white">{item.title}</span>
                        </div>
                        <span className="text-xs text-slate-500">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </motion.div>
  );
};
