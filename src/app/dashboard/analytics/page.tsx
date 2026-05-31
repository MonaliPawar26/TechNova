'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsDetailPage() {
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        setLoading(true);
        const res = await fetchApi('/analytics');
        if (res.success) {
          setCharts(res.charts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCharts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-slate-100 rounded-2xl skeleton" />
          <div className="h-80 bg-white border border-slate-100 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      <div className="flex justify-between items-center bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2.5">
          <BarChart3 className="text-primary-500" size={20} />
          <div>
            <h3 className="font-bold text-slate-800 display-font text-sm">Detailed Performance Intelligence</h3>
            <p className="text-[10px] text-slate-400">Deep-dive mathematical models for team sprint velocity.</p>
          </div>
        </div>
      </div>

      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Composed Chart (Tasks vs Completions) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Sprint Velocity Load & output</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={charts.lineChartData}>
                  <CartesianGrid stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Area type="monotone" dataKey="Completed" fill="#ede9fe" stroke="#8b5cf6" />
                  <Bar dataKey="Target" barSize={12} fill="#bae6fd" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="Completed" stroke="#7c3aed" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: AI Suggestions Flow */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">AI Suggestion Flow Capacity</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={charts.areaChartData}>
                  <CartesianGrid stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Area type="monotone" dataKey="Suggestions" fill="#e0f2fe" stroke="#0ea5e9" />
                  <Line type="monotone" dataKey="Executed" stroke="#f59e0b" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Department Efficiency */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Department Productivity Indices</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Bar dataKey="Efficiency" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Status Distribution */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h4 className="text-xs font-bold text-slate-700 display-font mb-6 uppercase tracking-wider">Operational Backlog Ratios</h4>
            <div className="h-72 flex flex-col sm:flex-row items-center justify-around">
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
    </div>
  );
}
