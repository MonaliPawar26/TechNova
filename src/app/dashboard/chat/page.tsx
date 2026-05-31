'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchApi } from '../../../lib/api';
import { useSocketStore } from '../../../store/socketStore';
import { useAuthStore } from '../../../store/authStore';
import { 
  Hash, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  User,
  Image as ImageIcon,
  Bot
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  
  const [activeTab, setActiveTab] = useState<'channels' | 'dms'>('channels');
  const [channels] = useState(['general', 'announcements', 'rnd-ai', 'product-ops']);
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeDmUser, setActiveDmUser] = useState<any | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load message logs when target room changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        let endpoint = '';
        if (activeTab === 'channels') {
          endpoint = `/messages/channel/${activeChannel}`;
        } else if (activeTab === 'dms' && activeDmUser) {
          endpoint = `/messages/dm/${activeDmUser.id || activeDmUser._id}`;
        }

        if (endpoint) {
          const res = await fetchApi(endpoint);
          if (res.success) {
            setMessages(res.messages);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Socket Join Room trigger
    if (socket) {
      if (activeTab === 'channels') {
        socket.emit('join:room', activeChannel);
      } else if (activeTab === 'dms' && activeDmUser) {
        const dmRoomId = [user?.id, activeDmUser.id || activeDmUser._id].sort().join('-');
        socket.emit('join:room', dmRoomId);
      }
    }
  }, [activeChannel, activeDmUser, activeTab, socket, user]);

  // Listen to incoming messages in real-time
  useEffect(() => {
    if (socket) {
      socket.on('message:new', (msg: any) => {
        // Append message if it matches our active room context
        const isCurrentChannel = activeTab === 'channels' && msg.channel === activeChannel;
        const isCurrentDm = activeTab === 'dms' && activeDmUser && 
          ((msg.sender === (activeDmUser.id || activeDmUser._id) && msg.recipient === user?.id) ||
           (msg.sender === user?.id && msg.recipient === (activeDmUser.id || activeDmUser._id)));

        if (isCurrentChannel || isCurrentDm) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('message:new');
      }
    };
  }, [socket, activeChannel, activeDmUser, activeTab, user]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      const payload: any = {
        content: text
      };

      if (activeTab === 'channels') {
        payload.channel = activeChannel;
      } else {
        payload.recipient = activeDmUser.id || activeDmUser._id;
      }

      // Submit message
      const data = await fetchApi('/messages', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setText('');
        
        // Emit Socket event to relay to other socket clients
        if (socket) {
          socket.emit('message:send', data.message);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(prev => prev + emoji);
    setEmojiOpen(false);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Online') return 'bg-emerald-500';
    if (status === 'Busy') return 'bg-rose-500';
    return 'bg-amber-500';
  };

  const emojis = ['😀', '👍', '🚀', '🔥', '🎉', '💡', '⚠️', '👀'];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-premium h-[75vh] flex overflow-hidden animate-in fade-in duration-300">
      {/* 1. LEFT SIDE PANEL */}
      <div className="w-64 border-r border-slate-100 flex flex-col shrink-0">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500">
          <button 
            onClick={() => { setActiveTab('channels'); setActiveDmUser(null); }}
            className={`flex-1 py-4 border-b-2 flex items-center justify-center space-x-1 transition-all ${activeTab === 'channels' ? 'border-primary-500 text-primary-600' : 'border-transparent hover:bg-slate-50'}`}
          >
            <Hash size={14} />
            <span>Channels</span>
          </button>
          <button 
            onClick={() => { setActiveTab('dms'); }}
            className={`flex-1 py-4 border-b-2 flex items-center justify-center space-x-1 transition-all ${activeTab === 'dms' ? 'border-primary-500 text-primary-600' : 'border-transparent hover:bg-slate-50'}`}
          >
            <MessageSquare size={14} />
            <span>Teammates</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'channels' ? (
            <div className="space-y-1">
              {channels.map(chan => (
                <button
                  key={chan}
                  onClick={() => setActiveChannel(chan)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${activeChannel === chan ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className="text-slate-400 font-bold">#</span>
                  <span className="truncate">{chan}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Teammates presence list */}
              {onlineUsers
                .filter(u => u.id !== user?.id)
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveDmUser(u)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${activeDmUser?.id === u.id ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="relative shrink-0">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${getStatusColor(u.status)}`} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="block truncate font-bold text-slate-700">{u.name}</span>
                      <span className="block text-[8px] text-slate-400 truncate">{u.role}</span>
                    </div>
                  </button>
                ))}
              {onlineUsers.filter(u => u.id !== user?.id).length === 0 && (
                <div className="text-center py-6 text-[10px] text-slate-400">No other users online.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT CHAT MAIN WINDOW */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {/* Chat window Header */}
        <div className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden text-left">
            {activeTab === 'channels' ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                  #
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 display-font uppercase tracking-wide">#{activeChannel}</h4>
                  <span className="text-[9px] text-slate-400">Workspace public discussion room</span>
                </div>
              </>
            ) : activeDmUser ? (
              <>
                <div className="relative shrink-0">
                  <img src={activeDmUser.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-100" />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${getStatusColor(activeDmUser.status)}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 display-font">{activeDmUser.name}</h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">{activeDmUser.department} &bull; {activeDmUser.role}</span>
                </div>
              </>
            ) : (
              <div className="text-xs font-bold text-slate-400">Select a teammate to start chat</div>
            )}
          </div>
        </div>

        {/* Message Feed Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex space-x-3 max-w-sm ${i % 2 === 0 ? 'ml-auto text-right' : ''}`}>
                  <div className="h-12 bg-white rounded-xl flex-1 skeleton" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-xs text-slate-400">
              <Bot size={32} className="mx-auto mb-2 text-primary-300 animate-bounce" />
              <span>This is the start of message logs. Type below to write...</span>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.sender === user?.id || (typeof m.sender === 'object' && m.sender?._id === user?.id);
              
              // Handle populated sender details
              const senderAvatar = m.senderDetails?.avatar || 'https://ui-avatars.com/api/?name=User';
              const senderName = m.senderDetails?.name || 'Teammate';

              return (
                <div key={idx} className={`flex items-end space-x-3 text-left ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMe && (
                    <img src={senderAvatar} alt="avatar" className="w-7 h-7 rounded-lg object-cover border border-slate-100 shrink-0" />
                  )}
                  <div className={`p-3 rounded-2xl max-w-sm text-xs border ${
                    isMe 
                      ? 'bg-primary-600 border-primary-500 text-white rounded-br-none' 
                      : 'bg-white border-slate-100 text-slate-700 rounded-bl-none'
                  }`}>
                    {!isMe && (
                      <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">{senderName}</span>
                    )}
                    <p className="leading-relaxed break-words">{m.content}</p>
                    <span className={`block text-[7px] text-right mt-1.5 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Panel */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSend} className="flex items-center space-x-2 relative">
            <button 
              type="button" 
              onClick={() => alert('File upload simulated! File link added.')}
              className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-400"
              title="Attach files"
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 focus:border-primary-500 rounded-xl text-xs outline-none bg-slate-50/50"
              placeholder={activeTab === 'channels' ? `Message #${activeChannel}...` : `Send direct message...`}
            />

            {/* Emoji Trigger panel */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setEmojiOpen(!emojiOpen)}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-400"
              >
                <Smile size={16} />
              </button>

              {emojiOpen && (
                <div className="absolute right-0 bottom-full mb-3 bg-white border border-slate-100 rounded-xl shadow-xl p-2.5 flex space-x-1.5 z-40 animate-in fade-in duration-200">
                  {emojis.map(e => (
                    <button key={e} type="button" onClick={() => handleEmojiClick(e)} className="hover:scale-125 transition-transform text-sm">{e}</button>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
