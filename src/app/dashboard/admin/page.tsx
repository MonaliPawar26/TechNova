'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import {
  ShieldAlert,
  Users,
  Activity,
  Trash2,
  Edit2,
  CheckCircle,
  ClipboardList,
  Server,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'metrics'>('users');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState('');

  // Enforce Admin-only access
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await fetchApi('/admin/users').catch(() => ({ success: false, users: [] }));
      if (usersRes.success) setUsers(usersRes.users || []);
    } catch (e) { console.error('Failed to load users:', e); }

    try {
      const logsRes = await fetchApi('/admin/logs').catch(() => ({ success: false, logs: [] }));
      if (logsRes.success) setLogs(logsRes.logs || []);
    } catch (e) { console.error('Failed to load logs:', e); }

    try {
      const metricsRes = await fetchApi('/admin/metrics').catch(() => ({ success: false, metrics: null }));
      if (metricsRes.success) setMetrics(metricsRes.metrics);
    } catch (e) { console.error('Failed to load metrics:', e); }

    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleUpdate = async (userId: string) => {
    try {
      const res = await fetchApi(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (res.success) {
        setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole } : u));
        setEditingUser(null);
      }
    } catch (err: any) {
      alert(`Role update failed: ${err.message}`);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: any = {
      Admin: 'bg-purple-100 text-purple-700',
      Manager: 'bg-sky-100 text-sky-700',
      'Team Lead': 'bg-pink-100 text-pink-700',
      Employee: 'bg-blue-100 text-blue-700'
    };
    return styles[role] || 'bg-slate-100 text-slate-600';
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 flex items-start space-x-3 text-sm font-semibold text-left">
        <ShieldAlert size={22} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Admin Access Required</h4>
          <p className="text-xs text-rose-600 mt-1">Your role ({user?.role}) does not have permission to access the Admin Control Panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 display-font text-sm">Admin Control Panel</h3>
            <p className="text-[10px] text-slate-400">System management, user roles, and security audit logs.</p>
          </div>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-400"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 text-xs font-bold">
        {(['users', 'metrics', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl border capitalize transition-all ${activeTab === tab ? 'bg-primary-600 text-white border-primary-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {tab === 'users' && <Users size={13} className="inline mr-1.5" />}
            {tab === 'metrics' && <Server size={13} className="inline mr-1.5" />}
            {tab === 'logs' && <ClipboardList size={13} className="inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-slate-100 rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <>
          {/* 1. USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
                <Users size={15} className="text-primary-500" />
                <span className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide">Registered Users ({users.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id || u._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-100" />
                            <div>
                              <div className="font-bold text-slate-800">{u.name}</div>
                              <div className="text-[9px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">{u.department}</td>
                        <td className="px-4 py-3">
                          {editingUser?.id === u.id || editingUser?._id === u._id ? (
                            <div className="flex space-x-1.5 items-center">
                              <select
                                value={newRole}
                                onChange={e => setNewRole(e.target.value)}
                                className="px-2 py-1 text-[10px] border border-slate-200 rounded-lg font-semibold outline-none"
                              >
                                <option value="Employee">Employee</option>
                                <option value="Team Lead">Team Lead</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleRoleUpdate(u.id || u._id)}
                                className="p-1 bg-emerald-100 text-emerald-600 rounded"
                              >
                                <CheckCircle size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getRoleBadge(u.role)}`}>
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-medium">
                          {u.joinedDate ? new Date(u.joinedDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => { setEditingUser(u); setNewRole(u.role); }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                          >
                            <Edit2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. METRICS TAB */}
          {activeTab === 'metrics' && metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-primary-500 bg-primary-50' },
                { label: 'Active Tasks', value: metrics.activeTasks, icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Pending Approvals', value: metrics.pendingApprovals, icon: ClipboardList, color: 'text-amber-500 bg-amber-50' },
                { label: 'Total Projects', value: metrics.totalProjects, icon: Server, color: 'text-sky-500 bg-sky-50' },
                { label: 'Messages Sent', value: metrics.totalMessages, icon: Activity, color: 'text-pink-500 bg-pink-50' },
                { label: 'Meetings Analyzed', value: metrics.totalMeetings, icon: ClipboardList, color: 'text-indigo-500 bg-indigo-50' }
              ].map((m, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                      <m.icon size={16} />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-800 display-font">{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 3. AUDIT LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
                <ClipboardList size={15} className="text-primary-500" />
                <span className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide">Security & Audit Logs ({logs.length})</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">No audit logs found.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <Activity size={13} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-700 truncate">{log.action}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-4">
                        <div className="text-[9px] font-bold text-slate-400">{log.user}</div>
                        <div className="text-[9px] text-slate-300 mt-0.5">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
