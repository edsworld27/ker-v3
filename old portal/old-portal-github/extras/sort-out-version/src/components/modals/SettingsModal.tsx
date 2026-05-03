import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Building2, LayoutTemplate, Shield, Database, Users, Plus, Trash2, ShieldCheck, Settings2, PlusCircle, Sparkles, CheckCircle2, Download, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AgencyBuilderView } from '../views/AgencyBuilderView';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddUser?: () => void;
  onOpenAddRole?: () => void;
  onEditUser?: (user: any) => void;
  onDeleteUser?: (userId: number) => void;
  onDeleteRole?: (roleId: string) => void;
  onExportData?: () => void;
  onExportWebsite?: () => void;
  exporting?: boolean;
}

export function SettingsModal({ isOpen, onClose, onOpenAddUser, onOpenAddRole, onEditUser, onDeleteUser, onDeleteRole, onExportData, onExportWebsite, exporting }: SettingsModalProps) {
  const { currentUser, userProfile, users, currentAgency, appTheme, setAppTheme, appLogo, setAppLogo, loginPortalType, setLoginPortalType, addLog, setAgencies, activeAgencyId } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'company' | 'agency' | 'builder'>('profile');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl h-[85vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
            <h2 className="text-xl font-semibold text-white">Global Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-64 border-r border-white/10 bg-black/10 p-4 space-y-2 overflow-y-auto">
              <TabButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={User} 
                label="My Profile" 
              />
              {currentUser?.role === 'Founder' && (
                <>
                  <TabButton 
                    active={activeTab === 'team'} 
                    onClick={() => setActiveTab('team')} 
                    icon={Users} 
                    label="Team & Roles" 
                  />
                  <TabButton 
                    active={activeTab === 'agency'} 
                    onClick={() => setActiveTab('agency')} 
                    icon={Shield} 
                    label="Agency Settings" 
                  />
                  <TabButton 
                    active={activeTab === 'builder'} 
                    onClick={() => setActiveTab('builder')} 
                    icon={LayoutTemplate} 
                    label="Agency Builder" 
                  />
                </>
              )}
              {['Founder', 'ClientOwner'].includes(currentUser?.role || '') && (
                <TabButton 
                  active={activeTab === 'company'} 
                  onClick={() => setActiveTab('company')} 
                  icon={Building2} 
                  label="Client Settings" 
                />
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {activeTab === 'profile' && (
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold mb-6">My Public Profile</h3>
                  <div className="glass-card p-8 rounded-3xl flex items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold shadow-xl shadow-indigo-600/20">
                      {userProfile.avatar}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{userProfile.name}</h3>
                      <p className="text-indigo-400 font-medium mb-4">{userProfile.role}</p>
                      <div className="space-y-2 text-sm text-slate-400">
                        <p>Email: {userProfile.email}</p>
                        <p>Member since: Jan 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="max-w-4xl space-y-8">
                  {/* User Management Section */}
                  <div className="glass-card p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        User Management
                      </h3>
                      <button 
                        onClick={onOpenAddUser}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add User
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-white/5">
                            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">User</th>
                            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Role</th>
                            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Permissions</th>
                            <th className="pb-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map(user => (
                            <tr key={user.id} className="group">
                              <td className="py-4">
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                              </td>
                              <td className="py-4">
                                <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-slate-400">
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex gap-1 flex-wrap items-center">
                                  {user.permissions.slice(0, 3).map(p => (
                                    <span key={p} className="text-[9px] text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded uppercase">
                                      {p}
                                    </span>
                                  ))}
                                  {user.permissions.length > 3 && (
                                    <span className="text-[9px] text-slate-500 px-1.5 py-0.5">
                                      +{user.permissions.length - 3}
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => onEditUser?.(user)}
                                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest ml-2 transition-colors border-b border-indigo-400/30"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <button 
                                  onClick={() => onDeleteUser?.(user.id)}
                                  className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Agency Roles Section */}
                  <div className="glass-card p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Agency Roles & Permissions</h3>
                          <p className="text-sm text-slate-500">Manage custom roles and granular permissions for your agency workforce.</p>
                        </div>
                      </div>
                      <button 
                        onClick={onOpenAddRole}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create New Role
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentAgency?.roles.map(role => (
                        <div key={role.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 transition-all group relative overflow-hidden border-b-4 border-b-indigo-500/0 hover:border-b-indigo-500/40">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            </div>
                            {role.isMaster ? (
                              <span className="px-3 py-1 bg-indigo-500 text-[9px] font-bold uppercase tracking-widest rounded-lg text-white shadow-lg shadow-indigo-500/40">Master Role</span>
                            ) : (
                               <span className="px-3 py-1 bg-white/10 text-[9px] font-bold uppercase tracking-widest rounded-lg text-slate-400">Custom Role</span>
                            )}
                          </div>
                          <h4 className="font-bold text-xl mb-2 tracking-tight">{role.name}</h4>
                          <p className="text-xs text-slate-500 mb-6 font-medium tracking-wide">
                            Access to {role.permissions.length} system modules
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-8">
                            {role.permissions.slice(0, 4).map(p => (
                              <span key={p} className="text-[9px] px-2 py-1 bg-white/5 rounded-lg text-slate-400 uppercase font-bold tracking-tighter border border-white/5">
                                {p.replace('-', ' ')}
                              </span>
                            ))}
                            {role.permissions.length > 4 && (
                              <span className="text-[10px] px-2 py-1 text-slate-600 font-black italic">+{role.permissions.length - 4} More</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                              <Settings2 className="w-3.5 h-3.5" />
                              Edit Mapping
                            </button>
                            {!role.isMaster && (
                              <button 
                                onClick={() => onDeleteRole?.(role.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete Role
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agency' && (
                <div className="max-w-4xl space-y-8">
                  <h3 className="text-2xl font-semibold mb-6">Global Agency Settings</h3>
                  
                  {/* App Customization Section */}
                  <div className="glass-card p-8 rounded-3xl space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">App Customization</h3>
                        <p className="text-sm text-slate-500">Personalize the portal's appearance and branding.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Select Theme</label>
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { id: 'indigo', color: 'bg-indigo-600' },
                              { id: 'cyan', color: 'bg-cyan-600' },
                              { id: 'emerald', color: 'bg-emerald-600' },
                              { id: 'rose', color: 'bg-rose-600' }
                            ].map(theme => (
                              <button
                                key={theme.id}
                                onClick={() => setAppTheme(theme.id)}
                                className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                                  appTheme === theme.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full ${theme.color}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Company Logo</label>
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                              {appLogo ? (
                                <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <Building2 className="w-8 h-8 text-slate-700" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <button 
                                onClick={() => {
                                  const url = prompt('Enter Logo URL (or leave blank for default):');
                                  if (url !== null) {
                                    setAppLogo(url || null);
                                    addLog('App Customization', `Company logo updated`, 'action');
                                  }
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all"
                              >
                                Upload New Logo
                              </button>
                              <p className="text-[10px] text-slate-500">Recommended size: 512x512px. PNG or SVG.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Login Diversion System</label>
                          <div className="space-y-3">
                            <button
                              onClick={() => setLoginPortalType('standard')}
                              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                                loginPortalType === 'standard' 
                                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' 
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              <div>
                                <div className="font-medium">Standard Login Portal</div>
                                <div className="text-[10px] opacity-60">Use our default secure authentication system.</div>
                              </div>
                              <CheckCircle2 className={`w-5 h-5 ${loginPortalType === 'standard' ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                            <button
                              onClick={() => {
                                setLoginPortalType('branded');
                                addLog('App Customization', `Login portal type changed to Branded`, 'action');
                              }}
                              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                                loginPortalType === 'branded' 
                                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' 
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              <div>
                                <div className="font-medium">Branded Portal</div>
                                <div className="text-[10px] opacity-60">Redirect users to your own custom branded login page.</div>
                              </div>
                              <CheckCircle2 className={`w-5 h-5 ${loginPortalType === 'branded' ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Protection Section */}
                  <div className="glass-card p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Data Protection & Privacy</h3>
                        <p className="text-sm text-slate-500">Manage your data and how it's handled within the portal.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                        <h4 className="font-medium text-sm">Data Portability</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Download a complete copy of your account data in a machine-readable format.</p>
                        <button 
                          onClick={onExportData}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Export Data
                        </button>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                        <h4 className="font-medium text-sm">Website Backups</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Export all your website files, assets, and configurations as a ZIP archive.</p>
                        <button 
                          onClick={onExportWebsite}
                          disabled={exporting}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          <Download className="w-3 h-3" />
                          {exporting ? 'Exporting...' : 'Download ZIP'}
                        </button>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                        <h4 className="font-medium text-sm">Privacy Settings</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Configure your data retention policies and third-party data sharing.</p>
                        <button className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                          <Settings2 className="w-3 h-3" />
                          Manage privacy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'company' && ['Founder', 'ClientOwner'].includes(currentUser?.role || '') && (
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold mb-6">Client Company Settings</h3>
                  <div className="glass-card p-6 rounded-3xl mb-6">
                    <h4 className="text-lg font-medium mb-4">Company Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">Company Name</label>
                        <input type="text" defaultValue="Client Corp" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-3xl">
                    <h4 className="text-lg font-medium mb-4">Data Management</h4>
                    <div className="flex gap-4">
                      <button 
                        onClick={onExportData}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Export All Data
                      </button>
                      <button 
                        onClick={onExportWebsite}
                        disabled={exporting}
                        className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export Website (ZIP)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'builder' && (
                <div className="-m-6">
                  <AgencyBuilderView />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
        active 
          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
