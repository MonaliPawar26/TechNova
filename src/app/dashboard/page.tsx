'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import { 
  CheckCircle, 
  TrendingUp, 
  Cpu, 
  Heart, 
  Calendar, 
  Bot, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>({
    completionRate: 87,
    efficiencyScore: 91,
    aiUtilization: 82,
    projectHealth: 88
  });
  
  const [charts, setCharts] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load Analytics
        const analyticsData = await fetchApi('/analytics');
        if (analyticsData.success) {
          setMetrics(analyticsData.metrics);
          setCharts(analyticsData.charts);
        }

        // Load Tasks
        const tasksData = await fetchApi('/tasks');
        if (tasksData.success) {
          setTasks(tasksData.tasks);
        }

        // Load Pending Approvals
        const approvalsData = await fetchApi('/approvals');
        if (approvalsData.success) {
          setApprovals(approvalsData.approvals.filter((a: any) => a.status === 'Pending'));
        }

        // Load Meetings
        const meetingsData = await fetchApi('/meetings');
        if (meetingsData.success) {
          setMeetings(meetingsData.meetings);
        }

        // Load Security Logs
        const logsData = await fetchApi('/admin/logs').catch(() => ({ success: false, logs: [] }));
        if (logsData.success) {
          setLogs(logsData.logs.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load dashboard parameters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl p-6 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-slate-100 rounded-2xl skeleton" />
          <div className="h-80 bg-white border border-slate-100 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  // Filter tasks due today
  const tasksDueToday = tasks.filter(t => {
    if (!t.deadline || t.status === 'Done') return false;
    const deadlineDate = new Date(t.deadline).toDateString();
    const today = new Date().toDateString();
    return deadlineDate === today;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Completion Rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden group hover:border-primary-100 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-800 display-font">{metrics.completionRate}%</span>
            <span className="text-xs text-emerald-500 font-semibold">+4.2%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Active tasks solved this sprint</p>
        </div>

        {/* Card 2: Efficiency Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden group hover:border-primary-100 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Efficiency Score</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-800 display-font">{metrics.efficiencyScore}%</span>
            <span className="text-xs text-primary-500 font-semibold">+1.8%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Velocity vs milestone targets</p>
        </div>

        {/* Card 3: AI Utilization */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden group hover:border-primary-100 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Cpu size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-800 display-font">{metrics.aiUtilization}%</span>
            <span className="text-xs text-indigo-500 font-semibold">+7.4%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Auto suggestions approved</p>
        </div>

        {/* Card 4: Project Health */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden group hover:border-primary-100 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project Health</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-slate-800 display-font">{metrics.projectHealth}%</span>
            <span className="text-xs text-rose-500 font-semibold">-0.5%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Risks and bottleneck prediction</p>
        </div>
      </div>

      {/* 2. CHARTS GRID */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Line Chart (Sprint Completions) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Sprint Completions vs Target</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Line type="monotone" dataKey="Completed" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Target" stroke="#38bdf8" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Bar Chart (Efficiency by Department) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Departmental Task Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Bar dataKey="Efficiency" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tasks" fill="#bae6fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart C: Area Chart (AI Suggestions Trend) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">AI Recommendation Engagement</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.areaChartData}>
                  <defs>
                    <linearGradient id="colorSuggestions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExecuted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Area type="monotone" dataKey="Suggestions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSuggestions)" />
                  <Area type="monotone" dataKey="Executed" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorExecuted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart D: Pie Chart (Task Status Breakdown) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Kanban Workflow Breakdown</h4>
            <div className="h-64 flex flex-col sm:flex-row items-center justify-around">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.pieChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600 font-semibold w-1/3">
                {charts.pieChartData.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. WIDGETS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Tasks Due Today */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col">
          <h4 className="text-xs font-bold text-slate-700 display-font mb-4 uppercase tracking-wider flex items-center space-x-2">
            <Calendar size={15} className="text-primary-500" />
            <span>Tasks Due Today</span>
          </h4>
          <div className="flex-1 space-y-3">
            {tasksDueToday.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500" />
                <span>All clear! No tasks due today.</span>
              </div>
            ) : (
              tasksDueToday.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="overflow-hidden mr-2">
                    <span className="text-xs font-bold text-slate-800 block truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Priority: {t.priority}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary-100 text-[9px] font-bold text-primary-700 uppercase">{t.status}</span>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/tasks" className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-primary-600 hover:text-primary-700">
            <span>Go to Kanban board</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Widget 2: Pending Reviews (Human Queue) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col">
          <h4 className="text-xs font-bold text-slate-700 display-font mb-4 uppercase tracking-wider flex items-center space-x-2">
            <Bot size={15} className="text-primary-500 animate-pulse" />
            <span>AI Suggestions Pending Review</span>
          </h4>
          <div className="flex-1 space-y-3">
            {approvals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Cpu size={24} className="mx-auto mb-2 text-primary-300" />
                <span>Approval queue is empty. AI models idling.</span>
              </div>
            ) : (
              approvals.slice(0, 3).map((a, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-rose-100 bg-rose-50/20 text-left">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">{a.title}</span>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{a.explainableAI.reason}</p>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/approvals" className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-primary-600 hover:text-primary-700">
            <span>Manage Approvals Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Widget 3: Recent Activity (Security Logs) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col">
          <h4 className="text-xs font-bold text-slate-700 display-font mb-4 uppercase tracking-wider flex items-center space-x-2">
            <ClipboardList size={15} className="text-primary-500" />
            <span>Recent Activities</span>
          </h4>
          <div className="flex-1 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No logs found.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-[10px] text-slate-500 border-l-2 border-slate-200 pl-3 py-1">
                  <div className="font-bold text-slate-700">{log.action}</div>
                  <div className="mt-0.5">{log.details}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()} &bull; {log.user}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
