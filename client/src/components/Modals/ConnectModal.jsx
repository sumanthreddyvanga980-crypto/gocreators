import React, { useState } from 'react';
import { Send, Lock, Unlock, X, Shield, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ConnectModal = ({ targetUser, onClose, onSuccess }) => {
  const [note, setNote] = useState('Would love to connect and explore collaboration on short film & reel productions.');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!targetUser) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendConnectionRequest(targetUser._id, note);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Connect with {targetUser.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Connection Request Sent!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Once {targetUser.name} accepts your request, their personal phone number and HD photo will be automatically revealed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            
            {/* Privacy Notification Banner */}
            <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-3.5 flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Conditional Privacy Mechanics:</span> Phone numbers and profile photos are masked to protect creators from unsolicited spam. They unlock instantly when mutual connection is accepted.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Personalized Invitation Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

