import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Ban, CheckCircle2, AlertTriangle, RefreshCw, X, Flame } from 'lucide-react';
import { api } from '../services/api';

export const ModerationDashboard = ({ isOpen, onClose, onRefreshCrew }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getModerationStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const handleTestBan = async (userId, name) => {
    try {
      const res = await api.triggerTestBan(userId);
      setActionNotice(`Auto-ban triggered for ${name}: reports set to 16, account suspended instantly.`);
      loadStats();
      if (onRefreshCrew) onRefreshCrew();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async (userId, name) => {
    try {
      const res = await api.resetUserReports(userId);
      setActionNotice(`Reports reset to 0 for ${name}. Account restored.`);
      loadStats();
      if (onRefreshCrew) onRefreshCrew();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Automated Moderation & Safety Center</span>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  15-Report Ban Rule
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Fault-tolerant safety monitor with real-time automated threshold enforcement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
              title="Refresh moderation metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Safety Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Creators
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Verified Profiles
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Flagged Creators
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">
              {stats?.reportedUsers?.length || 0}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
              Active Reports &lt; 15
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Auto-Suspended
            </div>
            <div className="text-xl font-black text-rose-900 mt-1">
              {stats?.blockedUsers || 0}
            </div>
            <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
              Threshold &gt; 15 Exceeded
            </div>
          </div>
        </div>

        {/* Core System Rule Card */}
        <div className="mb-4 p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-100">
              Strict Report Threshold Specification
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every user account on Go Creators is continuously monitored. If an account accumulates <span className="font-bold text-amber-300">&gt; 15 community reports</span>, the automated safety system instantly activates:
          </p>
          <ul className="text-[11px] text-slate-400 mt-2 space-y-1 list-disc list-inside">
            <li>Account status flips immediately to <code className="text-rose-400">isBlocked: true</code></li>
            <li>Profile is removed from the public crew directory & search index</li>
            <li>Active authentication tokens are rejected with HTTP 403 Forbidden</li>
          </ul>
        </div>

        {/* Flagged & Test Users List */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Flagged Creators & Testing Sandbox
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading safety telemetry...</div>
          ) : stats?.reportedUsers?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Zero community safety violations recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats?.reportedUsers?.map((u) => {
                const isOverThreshold = u.reports > 15;
                return (
                  <div
                    key={u._id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isOverThreshold
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.name}</span>
                          <span className="text-[10px] text-blue-600 font-semibold">({u.role})</span>
                          {isOverThreshold ? (
                            <span className="text-[9px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" /> Suspended (&gt;15)
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Under Review ({u.reports}/15)
                            </span>
                          )}
                        </div>

                        <div className="w-48 bg-slate-200 rounded-full h-1.5 mt-2">
                          <div
                            className={`h-1.5 rounded-full ${isOverThreshold ? 'bg-rose-600' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, (u.reports / 15) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive testing actions */}
                      <div className="flex items-center gap-2">
                        {!isOverThreshold ? (
                          <button
                            onClick={() => handleTestBan(u._id, u.name)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shadow-2xs flex items-center gap-1"
                            title="Trigger 16th report to test auto-block"
                          >
                            <Flame className="w-3 h-3" />
                            <span>Trigger Ban</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReset(u._id, u.name)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl"
                            title="Reset reports to 0"
                          >
                            Restore Account
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

