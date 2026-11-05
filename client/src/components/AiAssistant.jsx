import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, ChevronRight, Film, Lightbulb, Shield, Camera } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SUGGESTIONS = [
  'Suggest 3 unique visual approaches for the diner scene',
  'Find Cinematographers with RED V-Raptor / FX3 in LA',
  'How does privacy data masking protect creators?',
  'What happens when an account reaches 15 reports?'
];

export const AiAssistant = ({ onClose, onNavigateCategory }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'msg-initial',
      sender: 'ai',
      text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I am your **Go Creators AI Production Copilot**.\n\nI can help you build your dream crew, develop lighting setups, review scene drafts, and navigate our privacy & moderation system.`,
      suggestions: DEFAULT_SUGGESTIONS
    },
    {
      id: 'msg-demo-user',
      sender: 'user',
      text: 'Suggest 3 unique visual approaches for the diner scene'
    },
    {
      id: 'msg-demo-ai',
      sender: 'ai',
      text: `Here are three distinct visual approaches for your diner scene:

1. **Cinematic Noir**: High contrast lighting, deep shadows, and rain-streaked windows. Focus on low-key illumination and high specular reflection on wet asphalt.
2. **Saturated 70s Retro**: Warm, filtered practical neon lights, textured surfaces, and a palette of deep vintage reds and mustard yellows. Focus on nostalgic anamorphic lenses.
3. **Naturalistic Minimalism**: Soft, diffused window light, cool muted tones, and clean, simple compositions. Focus on subtlety and character reaction.`,
      suggestions: [
        'Find Cinematographers with anamorphic lenses',
        'Draft shot list for Night Street scene'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMsg = { id: userMessageId, sender: 'user', text: text.trim() };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.askAI(text.trim());

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.text,
          matchedCrew: response.matchedCrew,
          suggestions: response.suggestions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `I encountered an issue processing your query: ${err.message}. Please try again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-full max-h-[820px] overflow-hidden">
      
      {/* Header matching mockup */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-100 uppercase">
              GOCRATERS AI ASSISTANT
            </h3>
            <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Online • Cinema Guide
            </span>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Greeting Title */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-sm font-bold text-slate-200">
          How can I help you, {user ? user.name.split(' ')[0] : 'Creator'}?
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs shadow-inner'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-1">
                {msg.text}
              </div>

              {/* Matched Crew Shortcuts if returned */}
              {msg.matchedCrew && msg.matchedCrew.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    Recommended Talent:
                  </div>
                  {msg.matchedCrew.map((c) => (
                    <div 
                      key={c._id}
                      onClick={() => onNavigateCategory && onNavigateCategory(c.role.toLowerCase())}
                      className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg hover:bg-slate-900 cursor-pointer border border-slate-700/40"
                    >
                      <div className="flex items-center gap-2">
                        <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[11px] font-semibold text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-blue-400">({c.role})</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Chips attached to AI reply */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting cinema production knowledge base...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form matching reference UI */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-800/80 rounded-2xl px-3 py-1.5 border border-slate-700 focus-within:border-blue-500"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};

