'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
import { fetchApi } from '../../lib/api';
import { 
  LayoutDashboard, 
  Trello, 
  MessageSquare, 
  FileCheck, 
  FolderKey, 
  BarChart3, 
  Layers, 
  FileClock,
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  Bell, 
  Bot,
  Activity,
  User,
  Mail,
  Calendar,
  MapPin,
  Building,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const { isConnected, socket, updateStatus } = useSocketStore();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState<'Online' | 'Busy' | 'Away'>('Online');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

  // Sync auth check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load initial notifications & subscribe to new ones
  useEffect(() => {
    if (!user) return;

    // Fetch past notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetchApi('/admin/logs'); // can read logs or specific notifications if routes exist. Let's create dummy notifications or fetch from server.
        // For simplicity, let's seed some notifications locally if empty, or fetch them if backend supports
        const seedNotifs = [
          { id: '1', title: 'Task Assigned', content: 'Rahul Sharma assigned you: "Integrate Gemini API – Batch 1"', read: false, createdAt: new Date() },
          { id: '2', title: 'Approval Needed', content: 'AI suggested workload rebalance for Pranjal Navgale\'s pipeline', read: false, createdAt: new Date() },
          { id: '3', title: 'Sprint Review', content: 'TechNova Q3 Sprint Planning meeting starts in 30 minutes', read: false, createdAt: new Date() },
          { id: '4', title: 'AI Report Ready', content: 'Monthly productivity report generated for Bengaluru HQ', read: false, createdAt: new Date() }
        ];
        setNotifications(seedNotifs);
      } catch (e) {
        // fallback
      }
    };
    fetchNotifications();

    if (socket) {
      socket.on('notification:new', (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
        // Simple browser notification chime
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
          audio.volume = 0.2;
          audio.play().catch(() => {});
        } catch (e) {}
      });
    }

    return () => {
      if (socket) {
        socket.off('notification:new');
      }
    };
  }, [socket, user]);

  const handleStatusChange = (status: 'Online' | 'Busy' | 'Away') => {
    setPresenceStatus(status);
    updateStatus(status);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin mb-4" />
        <span className="text-sm font-semibold text-slate-500">Securing environment...</span>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Kanban Tasks', path: '/dashboard/tasks', icon: Trello, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Slack Chat', path: '/dashboard/chat', icon: MessageSquare, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Approvals Queue', path: '/dashboard/approvals', icon: FileCheck, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Meeting Intelligence', path: '/dashboard/meetings', icon: Layers, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'AI Report Gen', path: '/dashboard/reports', icon: FileClock, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'My Profile', path: '/dashboard/profile', icon: User, roles: ['Employee', 'Team Lead', 'Manager', 'Admin'] },
    { name: 'Admin Panel', path: '/dashboard/admin', icon: FolderKey, roles: ['Admin'] }
  ];

  const getStatusColor = (status: string) => {
    if (status === 'Online') return 'bg-emerald-500';
    if (status === 'Busy') return 'bg-rose-500';
    return 'bg-amber-500'; // Away
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
      {/* 1. SIDEBAR */}
      <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-30 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              T
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-bold text-slate-800 display-font whitespace-nowrap">Tech<span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Nova</span></span>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden md:flex p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400">
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map((item, idx) => {
              const active = pathname === item.path;
              return (
                <Link 
                  key={idx} 
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* User profile footer - Clickable trigger */}
        <div className="p-4 border-t border-slate-100 flex flex-col space-y-3 relative">
          
          {/* Floating Profile Details Popover (Slack/Notion Style) */}
          {profilePopoverOpen && (
            <div className={`absolute bottom-20 ${sidebarCollapsed ? 'left-16 w-64' : 'left-4 right-4'} bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left`}>
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="relative shrink-0">
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(presenceStatus)}`} />
                </div>
                <div className="overflow-hidden">
                  <h6 className="text-xs font-bold text-slate-800 truncate">{user.name}</h6>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{user.role}</span>
                </div>
              </div>
              
              <div className="py-3 space-y-2.5 text-[10px] font-bold text-slate-500">
                <div className="flex items-center space-x-2">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building size={12} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600">🏢 {user.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600">📍 Bengaluru HQ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity size={12} className="text-violet-500 shrink-0" />
                  <span className="text-violet-600">⚡ Productivity: 94%</span>
                </div>
              </div>

              {/* Status Switcher in Popover */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-2 text-[9px] font-bold text-slate-600 mb-3">
                <span className="text-slate-400 block mb-1.5 uppercase">SYSTEM STATUS</span>
                <div className="flex space-x-1 justify-between">
                  <button 
                    onClick={() => handleStatusChange('Online')} 
                    className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${presenceStatus === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100'}`}
                  >
                    Online
                  </button>
                  <button 
                    onClick={() => handleStatusChange('Busy')} 
                    className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${presenceStatus === 'Busy' ? 'bg-rose-100 text-rose-700' : 'hover:bg-slate-100'}`}
                  >
                    Busy
                  </button>
                  <button 
                    onClick={() => handleStatusChange('Away')} 
                    className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${presenceStatus === 'Away' ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100'}`}
                  >
                    Away
                  </button>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex space-x-2">
                <button 
                  onClick={() => { setProfilePopoverOpen(false); router.push('/dashboard/profile'); }}
                  className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[9px] font-extrabold text-center transition-colors flex items-center justify-center space-x-1"
                >
                  <User size={10} />
                  <span>View Profile</span>
                </button>
                <button 
                  onClick={() => { setProfilePopoverOpen(false); handleLogout(); }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-extrabold text-center transition-colors flex items-center justify-center space-x-1"
                >
                  <LogOut size={10} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Trigger Footer Item */}
          <div 
            onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
            className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
            title="Click to view profile"
          >
            <div className="relative shrink-0 transition-transform group-hover:scale-105">
              <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(presenceStatus)}`} />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{user.name}</h5>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">{user.role}</span>
              </div>
            )}
            {!sidebarCollapsed && (
              <ChevronUp size={14} className={`text-slate-300 shrink-0 transition-transform duration-200 ${profilePopoverOpen ? 'rotate-180' : ''}`} />
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
              <span className="text-slate-400 font-semibold">STATUS</span>
              <div className="flex space-x-1.5">
                <button onClick={() => handleStatusChange('Online')} className={`px-2 py-0.5 rounded transition-colors ${presenceStatus === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100'}`}>On</button>
                <button onClick={() => handleStatusChange('Busy')} className={`px-2 py-0.5 rounded transition-colors ${presenceStatus === 'Busy' ? 'bg-rose-100 text-rose-700' : 'hover:bg-slate-100'}`}>Busy</button>
                <button onClick={() => handleStatusChange('Away')} className={`px-2 py-0.5 rounded transition-colors ${presenceStatus === 'Away' ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100'}`}>Away</button>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all shadow-sm shadow-rose-200"
          >
            <LogOut size={15} className="shrink-0" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-bold text-slate-700 display-font uppercase tracking-wide">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h4>
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400">
              <Activity size={10} className={isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
              <span>{isConnected ? 'Real-Time Sync Active' : 'Offline Mode'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification alert Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-500 relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notif Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-40 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
                    <span className="text-xs font-bold text-slate-700">Notifications</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-semibold text-primary-600 hover:text-primary-700">Clear all</button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">No new notifications.</div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors text-left border border-slate-100">
                          <h6 className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span>{n.title}</span>
                          </h6>
                          <p className="text-[10px] text-slate-500 mt-1">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-100" />
            
            {/* User department badge */}
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-primary-50 text-[10px] font-bold text-primary-600 border border-primary-100">
              🏢 {user.department}
            </span>
          </div>
        </header>

        {/* Dashboard Pages Mount */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>

      {/* 3. PREMIUM PROFILE MODAL (GLASSMORPHIC DIALOG) */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in scale-in duration-300">
            {/* Header pattern banner */}
            <div className="h-28 bg-gradient-to-tr from-primary-600 to-accent-500 relative flex items-end px-6 pb-4">
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/35 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar & Floating Name */}
            <div className="px-6 -mt-10 relative pb-6 border-b border-slate-100">
              <div className="flex items-end justify-between">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg bg-white" 
                  />
                  <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(presenceStatus)}`} />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary-50 text-[10px] font-bold text-primary-600 border border-primary-100">
                  🏢 {user.department}
                </span>
              </div>

              <div className="mt-4 text-left">
                <h3 className="text-lg font-bold text-slate-800 display-font">{user.name}</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{user.role}</p>
              </div>
            </div>

            {/* Profile Grid Info */}
            <div className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                  <Mail size={15} className="text-slate-400" />
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Email Address</span>
                    <span className="text-[11px] text-slate-700 font-semibold block truncate" title={user.email}>{user.email}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                  <MapPin size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Branch HQ</span>
                    <span className="text-[11px] text-slate-700 font-semibold block truncate">Bengaluru</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                  <Calendar size={15} className="text-slate-400" />
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Joined Date</span>
                    <span className="text-[11px] text-slate-700 font-semibold block truncate">
                      {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Active Member'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                  <Bot size={15} className="text-primary-500 animate-pulse" />
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">AI Autonomy</span>
                    <span className="text-[11px] text-primary-600 font-bold block truncate">
                      {user.role === 'Admin' || user.role === 'Manager' ? 'Full Veto' : 'Co-pilot'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Startup KPI Badge Section */}
              <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-violet-400 block font-bold uppercase tracking-wider">Productivity Score</span>
                  <span className="text-sm font-extrabold text-violet-700 display-font mt-0.5 block">94% — Elite Contributor</span>
                </div>
                <div className="px-2.5 py-1 bg-violet-600 text-[9px] font-bold text-white rounded-lg">
                  TECHNOVA CHAMPION
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex space-x-3">
                <button 
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => { setProfileModalOpen(false); handleLogout(); }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-100 flex items-center justify-center space-x-1.5"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
