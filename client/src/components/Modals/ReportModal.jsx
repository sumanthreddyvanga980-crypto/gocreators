import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle, Flame, ShieldCheck, Ban } from 'lucide-react';
import { api } from '../../services/api';

const REPORT_REASONS = [
  'Inappropriate / Offensive Content',
  'Fake Profile / Impersonation',
  'Harassment or Unsolicited Spam',
  'Copyright Infringement',
  'Unprofessional Conduct / Ghosting',
  'Other Violation'
];

export const ReportModal = ({ targetUser, onClose, onSuccess }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!targetUser) return null;

  const currentReports = targetUser.reports || 0;
  const reportsRemaining = Math.max(0, 15 - currentReports);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.reportUser(targetUser._id, { reason, details });
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestTriggerBan = async () => {
    setSubmitting(true);
    try {
      const res = await api.triggerTestBan(targetUser._id);
      setResult({
        message: res.message,
        reportsCount: res.user.reports,
        isBlocked: res.user.isBlocked,
        threshold: 15
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Community Safety Report
              </h3>
              <p className="text-[11px] text-slate-500">
                Flagging: <span className="font-semibold text-slate-800">{targetUser.name}</span> ({targetUser.role})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Strict Moderation Threshold Gauge */}
        <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Strict Report Threshold
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {result ? result.reportsCount : currentReports} / 15 Reports
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                (result?.reportsCount || currentReports) > 15
                  ? 'bg-rose-600'
                  : (result?.reportsCount || currentReports) > 10
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min(100, (((result?.reportsCount || currentReports)) / 15) * 100)}%`
              }}
            />
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            Safety Rule: Any account accumulating <span className="font-bold text-rose-600">more than 15 reports</span> is automatically locked out and blocked from the platform.
          </p>
        </div>

        {result ? (
          <div className="py-4 space-y-3">
            {result.isBlocked ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <Ban className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-rose-900">
                  Account Automatically Suspended!
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {result.message}
                </p>
                <div className="text-[10px] text-rose-600 font-semibold bg-rose-100/60 py-1 px-2 rounded-lg">
                  Profile removed from public discovery & login credentials revoked.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Report Successfully Logged</h4>
                <p className="text-xs text-emerald-700">{result.message}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe the violation, suspicious link, or misconduct..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {/* Quick Testing Trigger Button */}
              <button
                type="button"
                onClick={handleTestTriggerBan}
                disabled={submitting}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer flex items-center gap-1"
                title="Testing Shortcut: sets report count to 16 to observe the automated block trigger instantly"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Simulate 15+ Ban Trigger</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

