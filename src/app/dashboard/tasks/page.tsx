'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { useSocketStore } from '../../../store/socketStore';
import { useAuthStore } from '../../../store/authStore';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Bot, 
  AlertTriangle,
  X,
  Send,
  ClipboardList
} from 'lucide-react';

export default function KanbanPage() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Create task inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');

  const statuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  const loadTasksAndUsers = async () => {
    try {
      setLoading(true);
      const tasksData = await fetchApi('/tasks');
      if (tasksData.success) {
        setTasks(tasksData.tasks);
      }
      
      const usersData = await fetchApi('/admin/users').catch(() => ({ success: false, users: [] }));
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksAndUsers();

    if (socket) {
      // Sync board changes in real-time when another user drags a card
      socket.on('task:moved', (data: { taskId: string; toStatus: string }) => {
        setTasks(prev => prev.map(t => 
          (t._id === data.taskId || t.id === data.taskId) ? { ...t, status: data.toStatus } : t
        ));
      });

      // Reload when a new task is created by someone
      socket.on('task:new', () => {
        loadTasksAndUsers();
      });
    }

    return () => {
      if (socket) {
        socket.off('task:moved');
        socket.off('task:new');
      }
    };
  }, [socket]);

  // Handle HTML5 Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistically update status
    setTasks(prev => prev.map(t => 
      (t._id === taskId || t.id === taskId) ? { ...t, status: toStatus } : t
    ));

    try {
      await fetchApi(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: toStatus })
      });
    } catch (error) {
      console.error('Failed to update task status on server:', error);
      // Reload tasks if fail to revert
      loadTasksAndUsers();
    }
  };

  // Create task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const data = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          assignee: assignee || null,
          priority,
          deadline,
          status: 'To Do'
        })
      });

      if (data.success) {
        setTasks(prev => [...prev, data.task]);
        setIsCreateOpen(false);
        // Clear inputs
        setTitle('');
        setDescription('');
        setAssignee('');
        setPriority('Medium');
        setDeadline('');
        
        // Notify others
        if (socket) {
          socket.emit('task:create', data.task);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post comment inside task detailed modal
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      const taskId = selectedTask._id || selectedTask.id;
      const data = await fetchApi(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment })
      });

      if (data.success) {
        // Appends comments
        const updatedTask = data.task;
        setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? updatedTask : t));
        setSelectedTask(updatedTask);
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Get user avatar by ID
  const getUserDetails = (userId: string) => {
    const found = users.find(u => u.id === userId || u._id === userId);
    return found ? { name: found.name, avatar: found.avatar } : { name: 'Unassigned', avatar: '' };
  };

  // Filter tasks based on search & priority dropdown
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center skeleton h-12 rounded-xl" />
        <div className="grid grid-cols-5 gap-4 h-96">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative h-full">
      {/* 1. FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-primary-500 rounded-xl text-xs outline-none bg-slate-50/50"
              placeholder="Search tasks..."
            />
          </div>
          
          <div className="flex items-center space-x-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50">
            <Filter size={14} className="text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-transparent outline-none font-semibold text-slate-600"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center space-x-1.5 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. BOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {statuses.map(status => {
          const columnTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div 
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col max-h-[70vh]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{status}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards Column */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {columnTasks.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center text-[10px] text-slate-400">
                    Drag tasks here
                  </div>
                ) : (
                  columnTasks.map(t => {
                    const assigneeDetail = t.assignee ? getUserDetails(t.assignee) : { name: 'Unassigned', avatar: '' };
                    const priorityColors: any = {
                      Critical: 'bg-rose-50 border-rose-100 text-rose-600',
                      High: 'bg-orange-50 border-orange-100 text-orange-600',
                      Medium: 'bg-sky-50 border-sky-100 text-sky-600',
                      Low: 'bg-slate-100 border-slate-200 text-slate-500'
                    };

                    return (
                      <div
                        key={t._id || t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t._id || t.id)}
                        onClick={() => setSelectedTask(t)}
                        className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-shadow hover:border-slate-200 text-left active:cursor-grabbing"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`px-2 py-0.5 border rounded text-[8px] font-bold uppercase ${priorityColors[t.priority] || 'bg-slate-100'}`}>
                            {t.priority}
                          </span>
                          
                          {/* AI Priority score indicator badge */}
                          {t.priorityScore && (
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                              <Bot size={10} />
                              <span>{t.priorityScore}</span>
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">{t.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">{t.description}</p>

                        <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-2 text-[9px] text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            {t.deadline && (
                              <div className="flex items-center space-x-0.5">
                                <Calendar size={10} />
                                <span>{new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {t.comments?.length > 0 && (
                              <div className="flex items-center space-x-0.5">
                                <MessageSquare size={10} />
                                <span>{t.comments.length}</span>
                              </div>
                            )}
                            {assigneeDetail.avatar ? (
                              <img src={assigneeDetail.avatar} alt="Avatar" className="w-5 h-5 rounded-lg border border-slate-100 object-cover" title={assigneeDetail.name} />
                            ) : (
                              <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100 text-slate-400">
                                <User size={10} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Task Information</span>
                <h3 className="text-base font-bold text-slate-800 display-font mt-1 truncate">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400">
                <X size={16} />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left col - Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Explainable AI Block */}
                  {selectedTask.explainableAI && (
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs display-font">
                        <Bot size={18} className="text-indigo-600 animate-pulse" />
                        <span>Explainable AI Insights</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {selectedTask.explainableAI.reason}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div className="bg-white p-2 rounded-lg border border-indigo-100/40">
                          <span className="text-slate-400 block">AI Confidence Score</span>
                          <strong className="text-indigo-600 text-sm display-font mt-0.5 block">{selectedTask.explainableAI.confidenceScore}%</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-indigo-100/40">
                          <span className="text-slate-400 block">Risk Evaluation</span>
                          <strong className="text-rose-500 text-sm display-font mt-0.5 block">{selectedTask.explainableAI.riskLevel} Risk</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments Panel */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments ({selectedTask.comments?.length || 0})</h5>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {selectedTask.comments?.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">No comments posted yet.</div>
                      ) : (
                        selectedTask.comments.map((c: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start space-x-3 text-left">
                            <img src={c.userAvatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="flex items-center space-x-2">
                                <strong className="text-xs font-bold text-slate-700">{c.userName}</strong>
                                <span className="text-[8px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-normal">{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handlePostComment} className="flex space-x-2 pt-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 focus:border-primary-500 rounded-xl text-xs outline-none bg-slate-50/50"
                        placeholder="Add your comment..."
                      />
                      <button type="submit" className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right col - Meta info */}
                <div className="space-y-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100/60 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Status</span>
                    <span className="px-2 py-0.5 rounded bg-primary-100 text-[10px] font-bold text-primary-700 uppercase">{selectedTask.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-2">Assignee</span>
                    <div className="flex items-center space-x-2">
                      {selectedTask.assignee ? (
                        <>
                          <img src={getUserDetails(selectedTask.assignee).avatar} alt="Avatar" className="w-6 h-6 rounded-lg object-cover" />
                          <strong className="text-slate-700 font-semibold">{getUserDetails(selectedTask.assignee).name}</strong>
                        </>
                      ) : (
                        <span className="text-slate-500 font-medium italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Deadline</span>
                    <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                      <Calendar size={13} />
                      <span>{selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : 'No due date'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Risk Score</span>
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertTriangle size={13} className={selectedTask.riskScore > 60 ? 'text-rose-500' : 'text-slate-400'} />
                      <span className={selectedTask.riskScore > 60 ? 'text-rose-600' : 'text-slate-700'}>{selectedTask.riskScore}% Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-md w-full shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 display-font text-sm flex items-center space-x-1.5">
                <ClipboardList size={18} className="text-primary-500" />
                <span>Create Kanban Task</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
                  placeholder="Task title..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
                  placeholder="Task details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus size={16} />
                <span>Create Task</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
