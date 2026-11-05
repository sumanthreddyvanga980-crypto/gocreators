import React, { useState, useEffect } from 'react';
import { Inbox, Check, X, Shield, Unlock, Lock, Phone, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const IncomingRequestsModal = ({ isOpen, onClose, onRefreshCrew }) => {
  const { user, refreshPendingCount } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'connected'
  const [actionMessage, setActionMessage] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getConnections();
      setIncoming(data.incoming || []);
      setConnected(data.connected || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const handleRespond = async (connectionId, action) => {
    try {
      const res = await api.respondToConnection(connectionId, action);
      setActionMessage(res.message);
      refreshPendingCount();
      loadRequests();
      if (onRefreshCrew) onRefreshCrew();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connection Center
              </h3>
              <p className="text-[11px] text-slate-500">
                Manage invitations and unlocked creator contacts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {actionMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <Unlock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'incoming'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Requests ({incoming.length})
          </button>
          <button
            onClick={() => setActiveTab('connected')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'connected'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unlocked Contacts ({connected.length})
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading invitations...</div>
          ) : activeTab === 'incoming' ? (
            incoming.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Pending Requests</p>
                <p className="text-[11px] text-slate-400">You're all caught up on creator invitations.</p>
              </div>
            ) : (
              incoming.map((req) => (
                <div key={req._id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={req.sender?.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {req.sender?.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-blue-600 uppercase">
                          {req.sender?.role} • {req.sender?.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespond(req._id, 'accept')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                        title="Accept to unlock personal phone and photo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, 'decline')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Decline"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    "{req.note}"
                  </p>
                </div>
              ))
            )
          ) : (
            connected.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active connections yet. Explore the crew directory to connect!
              </div>
            ) : (
              connected.map((item) => (
                <div key={item.connectionId} className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.user?.avatar}
                      alt={item.user?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {item.user?.name}
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          Revealed
                        </span>
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{item.user?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.user?.role}
                  </span>
                </div>
              ))
            )
          )}
        </div>

      </div>
    </div>
  );
};

