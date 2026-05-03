import React from 'react';
import { motion } from 'motion/react';
import { Plus, CreditCard, Users, Zap, ShieldCheck, Briefcase, Clock, MessageSquare, CheckCircle2, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DashboardWidget } from '../components/DashboardWidget';

export const AdminDashboardView: React.FC = () => {
  const { currentUser, isAgencyAdmin, clients, users, setShowAddClientModal } = useAppContext();

  return (
    <motion.div
      key="admin-dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-semibold mb-2">
            {currentUser?.role === 'Founder' ? 'Founder Command Center' : 
             currentUser?.role === 'AgencyManager' ? 'Agency Operations' : 
             'Employee Dashboard'}
          </h2>
          <p className="text-slate-500">
            {currentUser?.role === 'Founder' ? 'Global overview of your agency performance and growth.' : 
             currentUser?.role === 'AgencyManager' ? 'Manage your team, clients, and operational workflows.' : 
             'Track your assigned clients and daily tasks.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAgencyAdmin && (
            <button 
              onClick={() => setShowAddClientModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Client
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {currentUser?.role === 'Founder' ? (
          <>
            <DashboardWidget 
              icon={CreditCard} 
              label="Monthly Revenue" 
              value="$124,500" 
              trend="+12.5%" 
              color="emerald" 
            />
            <DashboardWidget 
              icon={Users} 
              label="Total Clients" 
              value={clients.length.toString()} 
              trend="+2" 
              color="indigo" 
            />
            <DashboardWidget 
              icon={Zap} 
              label="Agency Growth" 
              value="24%" 
              trend="+5%" 
              color="amber" 
            />
            <DashboardWidget 
              icon={ShieldCheck} 
              label="System Health" 
              value="99.9%" 
              trend="Stable" 
              color="blue" 
            />
          </>
        ) : currentUser?.role === 'AgencyManager' ? (
          <>
            <DashboardWidget 
              icon={Briefcase} 
              label="Active Projects" 
              value={clients.filter(c => c.stage !== 'live').length.toString()} 
              trend="On Track" 
              color="indigo" 
            />
            <DashboardWidget 
              icon={Users} 
              label="Team Capacity" 
              value="85%" 
              trend="-5%" 
              color="emerald" 
            />
            <DashboardWidget 
              icon={Clock} 
              label="Avg. Turnaround" 
              value="4.2 Days" 
              trend="-0.5d" 
              color="amber" 
            />
            <DashboardWidget 
              icon={MessageSquare} 
              label="Pending Feedback" 
              value="12" 
              trend="+3" 
              color="blue" 
            />
          </>
        ) : (
          <>
            <DashboardWidget 
              icon={Users} 
              label="Your Clients" 
              value={clients.filter(c => c.assignedEmployees?.includes(currentUser?.id || 0)).length.toString()} 
              trend="Active" 
              color="indigo" 
            />
            <DashboardWidget 
              icon={CheckCircle2} 
              label="Tasks Completed" 
              value="48" 
              trend="+12" 
              color="emerald" 
            />
            <DashboardWidget 
              icon={Star} 
              label="Client Rating" 
              value="4.9/5" 
              trend="+0.1" 
              color="amber" 
            />
            <DashboardWidget 
              icon={Zap} 
              label="Efficiency" 
              value="94%" 
              trend="+2%" 
              color="blue" 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentUser?.role === 'Founder' ? (
          <>
            {/* Operator Performance */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Operator Performance</h3>
              <div className="space-y-6">
                {[
                  { name: 'Sarah Jenkins', role: 'Agency Manager', clients: 12, rating: 4.9 },
                  { name: 'Michael Chen', role: 'Agency Manager', clients: 8, rating: 4.7 },
                  { name: 'Emma Wilson', role: 'Agency Manager', clients: 15, rating: 4.8 }
                ].map((op, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{op.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{op.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{op.rating} ★</div>
                      <div className="text-[10px] text-slate-500">{op.clients} Clients</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Clients */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Top Revenue Clients</h3>
              <div className="space-y-4">
                {clients.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{client.name}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{client.stage}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-indigo-400">£2,450/mo</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : currentUser?.role === 'AgencyManager' ? (
          <>
            {/* Pipeline Status */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Pipeline Status</h3>
              <div className="space-y-6">
                {[
                  { stage: 'Discovery', count: 5, color: 'bg-indigo-500' },
                  { stage: 'Onboarding', count: 3, color: 'bg-blue-500' },
                  { stage: 'Design', count: 8, color: 'bg-purple-500' },
                  { stage: 'Development', count: 12, color: 'bg-cyan-500' },
                  { stage: 'Live', count: 45, color: 'bg-emerald-500' }
                ].map((s, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{s.stage}</span>
                      <span className="font-bold">{s.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${s.color} transition-all duration-1000`} 
                        style={{ width: `${(s.count / 73) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Workload */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Team Workload</h3>
              <div className="space-y-4">
                {users.filter(u => u.role === 'AgencyEmployee').slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-[10px] text-slate-500">4 Active Clients</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      Available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Task List */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Your Tasks</h3>
              <div className="space-y-4">
                {[
                  { task: 'Review Design Feedback', client: 'Acme Corp', priority: 'High' },
                  { task: 'Update Staging Environment', client: 'Global Tech', priority: 'Medium' },
                  { task: 'Prepare Onboarding Docs', client: 'Nexus Solutions', priority: 'Low' }
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        t.priority === 'High' ? 'bg-red-500' :
                        t.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{t.task}</div>
                        <div className="text-[10px] text-slate-500">{t.client}</div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-medium mb-8">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {[
                  { item: 'Design V2 Approval', date: 'Mar 26', status: 'Pending' },
                  { item: 'Beta Launch', date: 'Mar 28', status: 'On Track' },
                  { item: 'Client Sync', date: 'Mar 30', status: 'Scheduled' }
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex flex-col items-center justify-center text-[10px] font-bold">
                        <span className="text-indigo-400">{d.date.split(' ')[0]}</span>
                        <span>{d.date.split(' ')[1]}</span>
                      </div>
                      <div className="text-sm font-medium">{d.item}</div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
