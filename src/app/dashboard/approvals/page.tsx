'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useSocketStore } from '../../../store/socketStore';
import { 
  Bot, 
  Check, 
  X as XIcon, 
  Sliders, 
  Calendar, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modify dialog
  const [modifyingItem, setModifyingItem] = useState<any | null>(null);
  const [modifiedDeadline, setModifiedDeadline] = useState('');
  
  const isPrivileged = user?.role === 'Manager' || user?.role === 'Team Lead' || user?.role === 'Admin';

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/approvals');
      if (res.success) {
        setApprovals(res.approvals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();

    if (socket) {
      socket.on('approval:new', () => {
        loadApprovals();
      });
      socket.on('approval:resolved', () => {
        loadApprovals();
      });
    }

    return () => {
      if (socket) {
        socket.off('approval:new');
        socket.off('approval:resolved');
      }
    };
  }, [socket]);

  // Review execution
  const handleReview = async (id: string, status: 'Approved' | 'Rejected', notes: string = '', modifiedData?: any) => {
    if (!isPrivileged) return;

    try {
      const action = modifiedData ? 'Modify' : (status === 'Approved' ? 'Approve' : 'Reject');
      const res = await fetchApi(`/approvals/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          modifierPayload: modifiedData
        })
      });

      if (res.success) {
        // Optimistically remove or update
        setApprovals(prev => prev.filter(a => a._id !== id && a.id !== id));
        setModifyingItem(null);
        
        // Broadcast
        if (socket) {
          socket.emit('approval:action', { id, status });
        }
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingItem || !modifiedDeadline) return;

    // Decode target suggestion data
    const origData = JSON.parse(modifyingItem.suggestedData);
    const updatedData = {
      ...origData,
      deadline: modifiedDeadline
    };

    handleReview(
      modifyingItem._id || modifyingItem.id, 
      'Approved', 
      `Modified suggested deadline to ${modifiedDeadline} by ${user?.name}`,
      updatedData
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 bg-white border border-slate-100 rounded-2xl skeleton" />
        ))}
      </div>
    );
  }

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const pastApprovals = approvals.filter(a => a.status !== 'Pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. R-BAC ALERT BANNER FOR EMPLOYEES */}
      {!isPrivileged && (
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl flex items-start space-x-3 text-xs font-semibold text-left">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold">Operational Controls Restricted</h5>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              Your active workspace profile role is <strong>{user?.role}</strong>. You have read-only access to optimization recommendations. Action controls (Approve/Reject) require a <strong>Team Lead</strong>, <strong>Manager</strong>, or <strong>Admin</strong> signature.
            </p>
          </div>
        </div>
      )}

      {/* 2. PENDING QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs display-font uppercase tracking-wide">
          <Clock size={16} className="text-primary-500" />
          <span>Active Approvals Queue ({pendingApprovals.length})</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-xs text-slate-400">
            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
            <span>All AI optimization items have been reviewed! Queue is empty.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map(appr => {
              const suggestedDate = appr.suggestedData ? JSON.parse(appr.suggestedData).deadline : '';
              
              return (
                <div key={appr._id || appr.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium grid grid-cols-1 lg:grid-cols-4 gap-6 text-left relative overflow-hidden">
                  <div className="lg:col-span-3 space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI SUGGESTION &bull; TYPE: {appr.type}</span>
                      <h4 className="text-sm font-bold text-slate-800 display-font mt-1">{appr.title}</h4>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <strong>AI Justification:</strong>
                      <p className="leading-relaxed mt-0.5">{appr.explainableAI.reason}</p>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-3 gap-4 text-[10px]">
                      <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                        <span className="text-slate-400 font-semibold block">Confidence Score</span>
                        <strong className="text-indigo-600 text-sm display-font mt-0.5 block">{appr.explainableAI.confidenceScore}%</strong>
                      </div>
                      <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                        <span className="text-slate-400 font-semibold block">Risk Level</span>
                        <strong className="text-rose-500 text-sm display-font mt-0.5 block">{appr.explainableAI.riskLevel}</strong>
                      </div>
                      {suggestedDate && (
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                          <span className="text-slate-400 font-semibold block">Suggested Date</span>
                          <strong className="text-slate-700 text-sm display-font mt-0.5 block">{new Date(suggestedDate).toLocaleDateString()}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Block */}
                  <div className="flex flex-col justify-center space-y-2 lg:border-l lg:border-slate-50 lg:pl-6">
                    <button 
                      disabled={!isPrivileged}
                      onClick={() => handleReview(appr._id || appr.id, 'Approved')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Check size={14} />
                      <span>Approve Suggestion</span>
                    </button>
                    <button 
                      disabled={!isPrivileged}
                      onClick={() => {
                        setModifyingItem(appr);
                        setModifiedDeadline(suggestedDate);
                      }}
                      className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                    >
                      <Sliders size={14} />
                      <span>Modify Parameters</span>
                    </button>
                    <button 
                      disabled={!isPrivileged}
                      onClick={() => handleReview(appr._id || appr.id, 'Rejected')}
                      className="w-full py-2.5 text-rose-500 hover:bg-rose-50 border border-transparent disabled:opacity-40 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                    >
                      <XIcon size={14} />
                      <span>Reject suggestion</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. HISTORICAL RESOLVED LIST */}
      {pastApprovals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs display-font uppercase tracking-wide">
            <CheckCircle size={16} className="text-emerald-500" />
            <span>Resolved Suggestions History ({pastApprovals.length})</span>
          </div>
          <div className="space-y-2">
            {pastApprovals.map(appr => (
              <div key={appr._id || appr.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs text-left">
                <div className="overflow-hidden mr-4">
                  <span className="font-bold text-slate-700 block truncate">{appr.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Reviewed by: {appr.requester}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${appr.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {appr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODIFY SUGGESTION DIALOG */}
      {modifyingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 display-font text-sm">Modify AI suggestion</h3>
              <button onClick={() => setModifyingItem(null)} className="p-1 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400">
                <XIcon size={14} />
              </button>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adjust Suggested Deadline</label>
                <input
                  type="date"
                  required
                  value={modifiedDeadline}
                  onChange={(e) => setModifiedDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Approve with modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
