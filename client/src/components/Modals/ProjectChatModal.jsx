import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, X, Film, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProjectChatModal = ({ project, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    if (!project) return;
    try {
      const data = await api.getProjectMessages(project._id);
      setMessages(data);
    } catch {
      // default initial project conversation
      setMessages([
        {
          _id: 'pm-1',
          sender: { name: 'Jane Reynolds', role: 'Director', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
          text: 'Welcome everyone to the Echoes of Silence production room! Shot list is locked for the Diner night scenes.',
          roleBadge: 'DIRECTOR',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'pm-2',
          sender: { name: 'Mark Davis', role: 'Cinematographer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
          text: 'RED V-Raptor package with Atlas anamorphic lenses arrives Thursday. Prepared high contrast low-light LUTs.',
          roleBadge: 'CINEMATOGRAPHER',
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          _id: 'pm-3',
          sender: { name: 'Les Martin', role: 'Scriptwriter', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
          text: 'Scene 14 dialogue revisions are uploaded. Tightened the pacing before the confrontation.',
          roleBadge: 'WRITER',
          createdAt: new Date(Date.now() - 900000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, project]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !project) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const sent = await api.sendProjectMessage(project._id, newMessage.trim());
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch {
      // optimistic fallback
      const fakeMsg = {
        _id: `temp-${Date.now()}`,
        sender: user || { name: 'You', role: 'Director' },
        text: newMessage.trim(),
        roleBadge: user?.role?.toUpperCase() || 'CREW',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, fakeMsg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full h-[620px] shadow-2xl flex flex-col text-white animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wide text-slate-100">
                  {project.title}
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                  Crew Room
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Common team chat area for all respective project members ({project.crew?.length || 6} Crew Active)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Crew Member Avatars Strip */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">
            Project Crew:
          </span>
          {project.crew && project.crew.map((member, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 flex-shrink-0"
              title={`${member.user?.name || 'Crew'} (${member.role})`}
            >
              <img
                src={member.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                alt={member.role}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-[11px] font-semibold text-slate-300">
                {member.user?.name ? member.user.name.split(' ')[0] : 'Crew'}
              </span>
              <span className="text-[9px] text-blue-400 font-bold">
                [{member.role}]
              </span>
            </div>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs scrollbar-thin">
          {messages.map((msg, i) => {
            const isMe = user && msg.sender?._id === user._id;
            const badge = msg.roleBadge || msg.sender?.role?.toUpperCase() || 'CREW';

            return (
              <div 
                key={msg._id || i}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {msg.sender?.name || 'Crew Member'}
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                    [{badge}]
                  </span>
                </div>

                <div 
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Post update or message to all project crew members..."
            className="flex-1 bg-slate-800/80 px-4 py-2.5 rounded-2xl text-xs text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

