'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { useSocketStore } from '../../../store/socketStore';
import { 
  Bot, 
  Sparkles, 
  FileText, 
  Calendar, 
  User, 
  Plus,
  Play,
  ArrowRight,
  ClipboardCheck,
  Cpu
} from 'lucide-react';

export default function MeetingsPage() {
  const { socket } = useSocketStore();
  
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<any | null>(null);
  
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadMeetings = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetchApi('/meetings');
      if (res.success) {
        setMeetings(res.meetings);
        if (res.meetings.length > 0 && !activeMeeting) {
          setActiveMeeting(res.meetings[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !transcript) return;

    setLoading(true);
    try {
      const res = await fetchApi('/meetings', {
        method: 'POST',
        body: JSON.stringify({ title, transcript })
      });

      if (res.success) {
        setMeetings(prev => [res.meeting, ...prev]);
        setActiveMeeting(res.meeting);
        setTitle('');
        setTranscript('');
      }
    } catch (err: any) {
      alert(`AI analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Convert an extracted AI Action Item into a live Kanban Task card!
  const handleConvertToTask = async (actionItem: { task: string; assignee: string; deadline: string }) => {
    try {
      // Find matching assignee user id from database if possible, or leave null
      const usersRes = await fetchApi('/admin/users').catch(() => ({ users: [] }));
      const foundUser = usersRes.users?.find((u: any) => u.name.toLowerCase().includes(actionItem.assignee.toLowerCase()));

      const taskPayload = {
        title: actionItem.task.slice(0, 80),
        description: `Extracted from meeting "${activeMeeting?.title}". Original task: ${actionItem.task}`,
        assignee: foundUser ? (foundUser.id || foundUser._id) : null,
        priority: 'High',
        deadline: actionItem.deadline,
        status: 'To Do'
      };

      const res = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskPayload)
      });

      if (res.success) {
        alert(`Successfully converted action item into a real Kanban task assigned to ${actionItem.assignee}!`);
        if (socket) {
          socket.emit('task:create', res.task);
        }
      }
    } catch (err: any) {
      alert(`Failed to save task: ${err.message}`);
    }
  };

  const loadDemoTranscript = (type: 'sprint' | 'db') => {
    if (type === 'sprint') {
      setTitle('Q3 Roadmap Sync');
      setTranscript(`John: I will build the Express API models and hook up socket handlers by June 2.
Sarah: I will design the core dashboard mockups and landing page by June 4.
Marcus: We agree to approve the Next.js 15 migration to keep packages updated.
John: That sounds good. We also decided to enforce weekly security audits.`);
    } else {
      setTitle('Database Audit & Latency Review');
      setTranscript(`John: Database query times exceeded 350ms on index tables. I will run secondary indexes by June 6.
Eleanor: We decided to deploy MongoDB Atlas clusters rather than local fallbacks for live environments.
Sarah: I will audit connection pools on the server by June 7.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* 1. UPLOADER & DEMOS PANEL */}
      <div className="lg:col-span-1 space-y-6 text-left">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <h3 className="font-bold text-slate-800 display-font text-sm flex items-center space-x-1.5 mb-4">
            <Bot size={18} className="text-primary-500 animate-pulse" />
            <span>AI Meeting Intelligence</span>
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
                placeholder="Weekly Standup Meeting"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Transcript</label>
              <textarea
                required
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
                placeholder="Paste dialogue transcripts or meeting minutes here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles size={14} />
              <span>{loading ? 'AI Summarizing...' : 'Analyze with Gemini AI'}</span>
            </button>
          </form>

          {/* Demos selector */}
          <div className="border-t border-slate-100 mt-6 pt-6">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Load Demo Transcripts</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => loadDemoTranscript('sprint')}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold text-slate-600 rounded-lg"
              >
                Sprint Kickoff
              </button>
              <button 
                onClick={() => loadDemoTranscript('db')}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold text-slate-600 rounded-lg"
              >
                Database Audit
              </button>
            </div>
          </div>
        </div>

        {/* History archive */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Meeting Archives</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {historyLoading ? (
              <div className="text-center py-4 skeleton h-12 rounded-lg" />
            ) : meetings.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No meeting history.</div>
            ) : (
              meetings.map(m => (
                <button
                  key={m._id || m.id}
                  onClick={() => setActiveMeeting(m)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold block transition-colors ${activeMeeting?._id === m._id || activeMeeting?.id === m.id ? 'bg-primary-50 border-primary-100 text-primary-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="truncate font-bold">{m.title}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{new Date(m.createdAt).toLocaleDateString()}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. RESULTS MAIN VIEW */}
      <div className="lg:col-span-2 text-left">
        {!activeMeeting ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-20 text-center text-xs text-slate-400 h-full flex flex-col justify-center items-center">
            <FileText size={48} className="text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-600">No active review target</h4>
            <p className="mt-1">Enter a meeting transcript on the left to test Gemini AI summary extractions.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-6">
            <div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">AI Synthesis Complete</span>
              <h2 className="text-xl font-bold text-slate-800 display-font mt-2">{activeMeeting.title}</h2>
              <span className="text-[10px] text-slate-400">{new Date(activeMeeting.createdAt).toLocaleString()}</span>
            </div>

            {/* AI Summary block */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide flex items-center space-x-1.5">
                <FileText size={15} className="text-primary-500" />
                <span>Executive Summary</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/60 whitespace-pre-line">
                {activeMeeting.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Decisions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide">Decisions Made</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeMeeting.decisions?.map((dec: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{dec}</span>
                    </li>
                  ))}
                  {(!activeMeeting.decisions || activeMeeting.decisions.length === 0) && (
                    <li className="text-slate-400 italic">No formal decisions recorded.</li>
                  )}
                </ul>
              </div>

              {/* Follow ups */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide">Next Follow-ups</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeMeeting.followUps?.map((fol: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span>{fol}</span>
                    </li>
                  ))}
                  {(!activeMeeting.followUps || activeMeeting.followUps.length === 0) && (
                    <li className="text-slate-400 italic">No follow-ups recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Extracted Action items converts to tasks */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-700 display-font uppercase tracking-wide flex items-center space-x-1.5">
                <ClipboardCheck size={16} className="text-primary-500" />
                <span>Extracted Action Items ({activeMeeting.actionItems?.length || 0})</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2.5">Action Task Description</th>
                      <th className="py-2.5">Assignee</th>
                      <th className="py-2.5">Suggested Due Date</th>
                      <th className="py-2.5 text-right">Commit Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeMeeting.actionItems?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700 max-w-xs truncate" title={item.task}>{item.task}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-bold">
                            👤 {item.assignee}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-500">{item.deadline}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleConvertToTask(item)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-[10px] shadow-sm flex items-center justify-center space-x-1 ml-auto"
                          >
                            <Plus size={10} />
                            <span>Create Kanban Card</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!activeMeeting.actionItems || activeMeeting.actionItems.length === 0) && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400 italic">No action items extracted.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
