import React, { useState, useEffect } from 'react';
import { MessageSquare, MoreVertical, Send, User, CheckCheck, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RecentChats = ({ activeChatUser, onSelectChatUser }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadRecentChats = async () => {
    try {
      const data = await api.getRecentChats();
      setChats(data);
    } catch {
      // fallback mock items if offline or no messages
      setChats([
        {
          user: {
            _id: 'mark-demo',
            name: 'Mark',
            role: 'Cinematographer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
          },
          lastMessage: 'Sent the mood board for the diner.',
          roleBadge: 'CINEMATOGRAPHER'
        },
        {
          user: {
            _id: 'les-demo',
            name: 'Les',
            role: 'Writer',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
          },
          lastMessage: 'What is the tone for Scene 14?',
          roleBadge: 'WRITER'
        },
        {
          user: {
            _id: 'ava-demo',
            name: 'Ava',
            role: 'Actor',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
          },
          lastMessage: 'I have a new headshot to upload.',
          roleBadge: 'ACTOR'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentChats();
  }, [user]);

  useEffect(() => {
    if (activeChatUser) {
      openChatWithUser(activeChatUser);
    }
  }, [activeChatUser]);

  const openChatWithUser = async (targetUser) => {
    setActiveConversation(targetUser);
    try {
      const messages = await api.getConversation(targetUser._id);
      setConversationMessages(messages);
    } catch {
      setConversationMessages([
        {
          _id: 'm1',
          sender: targetUser,
          text: `Hey ${user ? user.name : 'there'}, excited to connect on Go Creators!`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const newMsg = await api.sendMessage(activeConversation._id, replyText.trim());
      setConversationMessages(prev => [...prev, newMsg]);
      setReplyText('');
      loadRecentChats();
    } catch (err) {
      // optimistic fallback
      setConversationMessages(prev => [
        ...prev,
        {
          _id: `temp-${Date.now()}`,
          sender: user,
          text: replyText.trim(),
          createdAt: new Date().toISOString()
        }
      ]);
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl p-4 flex flex-col justify-between">
      
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase flex items-center gap-2">
          <span>RECENT CHATS</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </h3>
        <button className="text-slate-400 hover:text-white p-1">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* List of Recent Chats */}
      <div className="space-y-2 mb-3">
        {chats.map((chat, idx) => {
          const partner = chat.user;
          if (!partner) return null;
          const badgeText = chat.roleBadge || partner.role?.toUpperCase() || 'CREW';

          return (
            <div
              key={partner._id || idx}
              onClick={() => openChatWithUser(partner)}
              className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer transition-all border border-slate-700/50 hover:border-blue-500/50 group"
            >
              <div className="flex items-start gap-2.5">
                <img
                  src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={partner.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      [{badgeText}]
                    </span>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                      {partner.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Message Quick Action matching reference mockup */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => {
            if (chats[0]?.user) openChatWithUser(chats[0].user);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
        >
          <span>New Message</span>
          <Send className="w-3.5 h-3.5 text-blue-400" />
        </button>
      </div>

      {/* Interactive Chat Drawer Modal */}
      {activeConversation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full h-[520px] shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95">
            
            {/* Chat Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {activeConversation.name}
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-medium">
                      {activeConversation.role}
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-400">
                    Connected • Personal details revealed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveConversation(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin">
              {conversationMessages.map((msg, i) => {
                const isMe = msg.sender?._id === user?._id || msg.sender === 'user';
                return (
                  <div
                    key={msg._id || i}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type reply..."
                className="flex-1 bg-slate-800/80 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-400 outline-none border border-slate-700 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || sending}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

