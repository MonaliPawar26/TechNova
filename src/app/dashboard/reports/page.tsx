'use client';

import React, { useState } from 'react';
import { fetchApi, getBaseUrl } from '../../../lib/api';
import { 
  FileText, 
  Download, 
  Settings, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Velocity');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(false);
  const [reportPreview, setReportPreview] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReportPreview(null);

    try {
      const res = await fetchApi('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ type: reportType, range: dateRange })
      });

      if (res.success) {
        setReportPreview(res.report);
      }
    } catch (e: any) {
      alert(`Report compilation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCsvDownloadLink = () => {
    return `${getBaseUrl()}/api/reports/download/csv?type=${reportType}`;
  };

  const getPdfDownloadLink = () => {
    return `${getBaseUrl()}/api/reports/download/pdf?type=${reportType}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-in fade-in duration-300">
      {/* 1. REPORT BUILDER SETTINGS */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <h3 className="font-bold text-slate-800 display-font text-sm flex items-center space-x-1.5 mb-4">
            <Settings size={18} className="text-primary-500" />
            <span>Report Compiler Configuration</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Report Template Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
              >
                <option value="Velocity">Sprint Velocity & Performance</option>
                <option value="Audit">Database Index & Security Audit</option>
                <option value="Productivity">Workplace Productivity Index</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Current Sprint">Current Sprint Cycle</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles size={14} />
              <span>{loading ? 'Compiling Parameters...' : 'Compile Live Report'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. REPORT PREVIEW & DOWNLOADS */}
      <div className="lg:col-span-2">
        {!reportPreview ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-20 text-center text-xs text-slate-400 h-full flex flex-col justify-center items-center">
            <FileText size={48} className="text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-600">No report preview compiled</h4>
            <p className="mt-1">Use the left menu to compile a performance review document.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">Document Draft Loaded</span>
                <h2 className="text-base font-bold text-slate-800 display-font mt-1.5">{reportPreview.title}</h2>
                <span className="text-[9px] text-slate-400">Date Range: {reportPreview.range} &bull; Generated by SynergyAI Compiler</span>
              </div>

              {/* Action Downloads */}
              <div className="flex space-x-2 shrink-0">
                <a
                  href={getCsvDownloadLink()}
                  target="_blank"
                  className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>Download CSV</span>
                </a>
                <a
                  href={getPdfDownloadLink()}
                  target="_blank"
                  className="px-3.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Download size={15} />
                  <span>Download HTML/PDF</span>
                </a>
              </div>
            </div>

            {/* Performance Analytics metrics */}
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">Total Tasks Tracked</span>
                <strong className="text-slate-800 text-lg display-font">{reportPreview.details.totalTasks} Tasks</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">Efficiency Ratio</span>
                <strong className="text-slate-800 text-lg display-font">{reportPreview.details.efficiencyScore}%</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">AI Recommendation Rate</span>
                <strong className="text-slate-800 text-lg display-font">{reportPreview.details.aiUtilizationRate}%</strong>
              </div>
            </div>

            {/* Executive summary details text */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
              <h4 className="text-xs font-bold text-slate-700 display-font uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle size={15} className="text-emerald-500" />
                <span>Executive AI Synthesis Summaries</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                {reportPreview.details.summaryNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
