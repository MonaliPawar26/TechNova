'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import {
  Mail,
  MapPin,
  Building,
  Calendar,
  Bot,
  TrendingUp,
  ShieldCheck,
  Activity,
  Sliders,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
  Star,
  Zap,
  Award,
  Globe,
  Phone,
  Cpu,
  BarChart3,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [copilotName, setCopilotName] = useState('TechNova-Assistant');
  const [autoApprovals, setAutoApprovals] = useState(false);
  const [workloadRebalance, setWorkloadRebalance] = useState(true);
  const [smartNotifications, setSmartNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const n = localStorage.getItem('tn_copilot_name');
      const a = localStorage.getItem('tn_auto_approvals');
      const r = localStorage.getItem('tn_workload_rebalance');
      const s = localStorage.getItem('tn_smart_notifs');
      if (n) setCopilotName(n);
      if (a) setAutoApprovals(a === 'true');
      if (r) setWorkloadRebalance(r === 'true');
      if (s) setSmartNotifications(s === 'true');
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading profile…</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tn_copilot_name', copilotName);
        localStorage.setItem('tn_auto_approvals', String(autoApprovals));
        localStorage.setItem('tn_workload_rebalance', String(workloadRebalance));
        localStorage.setItem('tn_smart_notifs', String(smartNotifications));
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 900);
  };

  // Role-specific KPI values
  const kpi = (() => {
    switch (user.role) {
      case 'Admin':
        return { productivity: 98, completed: 48, pending: 3, alerts: 0, badge: 'Executive Veto', badgeColor: 'text-purple-600 bg-purple-50 border-purple-100' };
      case 'Manager':
        return { productivity: 95, completed: 36, pending: 7, alerts: 1, badge: 'Dept. Orchestrator', badgeColor: 'text-sky-600 bg-sky-50 border-sky-100' };
      case 'Team Lead':
        return { productivity: 93, completed: 32, pending: 9, alerts: 2, badge: 'Sprint Champion', badgeColor: 'text-pink-600 bg-pink-50 border-pink-100' };
      default:
        return { productivity: 91, completed: 24, pending: 12, alerts: 3, badge: 'Elite Engineer', badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    }
  })();

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-in fade-in duration-300">

      {/* ── SAVED TOAST ── */}
      {saved && (
        <div className="fixed top-5 right-6 z-50 flex items-center space-x-2.5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">Settings saved successfully</span>
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 1 — HERO BANNER + IDENTITY
      ══════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100">
        {/* Cover gradient */}
        <div className="h-40 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
          {/* Decorative radial circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5" />
          {/* Company badge */}
          <div className="absolute top-5 left-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
            TechNova Solutions Pvt Ltd · Bengaluru HQ
          </div>
          {/* Role badge top-right */}
          <div className={`absolute top-5 right-6 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${kpi.badgeColor}`}>
            {kpi.badge}
          </div>
        </div>

        {/* Profile Identity Row */}
        <div className="bg-white px-8 pt-0 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            {/* Avatar + name */}
            <div className="flex items-end space-x-5 -mt-10">
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-extrabold text-slate-800 display-font leading-tight">{user.name}</h1>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{user.role} &nbsp;·&nbsp; {user.department}</p>
              </div>
            </div>

            {/* Log out button — prominently placed */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-200 transition-all"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 2 — TWO-COLUMN GRID
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Contact & Corporate Info */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>Corporate Info</span>
            </h2>

            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Building, label: 'Department', value: user.department },
              { icon: MapPin, label: 'Branch HQ', value: 'Bengaluru, Karnataka' },
              { icon: Globe, label: 'Region', value: 'South India — APAC' },
              {
                icon: Calendar, label: 'Joined',
                value: user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active Member',
              },
              { icon: Phone, label: 'Office Ext.', value: '+91-80-XXXX-' + (Math.floor(Math.random() * 9000) + 1000) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-slate-400" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-700 block truncate" title={value}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Productivity Score Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200/50">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-1/4 w-16 h-16 rounded-full bg-white/5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 block relative">Productivity Score</span>
            <div className="flex items-baseline space-x-1 mt-1.5 relative">
              <span className="text-4xl font-black">{kpi.productivity}%</span>
              <span className="text-sm text-indigo-300 font-bold">/ 100</span>
            </div>
            <div className="mt-3 h-2 bg-white/20 rounded-full relative overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${kpi.productivity}%` }}
              />
            </div>
            <div className="mt-3 flex items-center space-x-1.5 relative">
              <Star size={12} className="text-yellow-300 fill-yellow-300" />
              <span className="text-[10px] font-bold text-indigo-100">Top Performer · TechNova Champion</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Task Deliverables */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-2 mb-5">
              <BarChart3 size={14} className="text-indigo-500" />
              <span>Workflow Deliverables</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: CheckCircle2, label: 'Completed', value: kpi.completed, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                { icon: Clock, label: 'In Progress', value: kpi.pending, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                { icon: AlertTriangle, label: 'Urgent Alerts', value: kpi.alerts, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`p-4 rounded-2xl border ${bg} flex flex-col items-center text-center space-y-2`}>
                  <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center`}>
                    <Icon size={18} className={color} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                  <span className={`text-2xl font-black display-font ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* AI Efficiency streak */}
            <div className="mt-5 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">AI-Assisted Efficiency</span>
                <span className="text-sm font-extrabold text-violet-700 mt-0.5 block">⚡ {kpi.badge} — {kpi.productivity}% Sprint Success</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className={i < Math.round(kpi.productivity / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Copilot & Platform Preferences */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-2 mb-5">
              <Sliders size={14} className="text-indigo-500" />
              <span>AI Copilot & Platform Preferences</span>
            </h2>

            <div className="space-y-5">
              {/* Copilot Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  AI Assistant Name
                </label>
                <div className="relative">
                  <Bot size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={copilotName}
                    onChange={e => setCopilotName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Custom AI assistant name…"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Used in AI meeting summaries and task suggestions.</p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Autonomous Approvals',
                    desc: 'Let AI pre-approve low-impact extensions automatically.',
                    value: autoApprovals,
                    onChange: () => setAutoApprovals(v => !v),
                    icon: Cpu,
                  },
                  {
                    label: 'Workload Balancing',
                    desc: 'Get alerts when tasks bottleneck in your department.',
                    value: workloadRebalance,
                    onChange: () => setWorkloadRebalance(v => !v),
                    icon: Users,
                  },
                  {
                    label: 'Smart Notifications',
                    desc: 'AI filters low-priority noise from your notification stream.',
                    value: smartNotifications,
                    onChange: () => setSmartNotifications(v => !v),
                    icon: Zap,
                  },
                ].map(({ label, desc, value, onChange, icon: Icon }) => (
                  <div key={label} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon size={13} className="text-indigo-500" />
                        <span className="text-[11px] font-bold text-slate-700">{label}</span>
                      </div>
                      <Toggle value={value} onChange={onChange} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Save Row */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-50">
                <span className={`text-[10px] font-semibold transition-all ${saved ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {saved ? '✓ Saved' : 'Unsaved changes'}
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>{saving ? 'Saving…' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone — Prominent Logout */}
          <div className="bg-white border border-rose-100 rounded-3xl shadow-sm p-6">
            <h2 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider flex items-center space-x-2 mb-4">
              <AlertTriangle size={14} className="text-rose-400" />
              <span>Session Management</span>
            </h2>
            <div className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-700">Sign out of TechNova Platform</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Logged in as <span className="font-bold text-slate-600">{user.name}</span> · {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-rose-200 transition-all"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
