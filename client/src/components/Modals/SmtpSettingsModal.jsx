import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Key, Server, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export const SmtpSettingsModal = ({ isOpen, onClose, onConfigSaved }) => {
  const [service, setService] = useState('gmail');
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState(587);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getSmtpStatus();
      setStatus(res);
      if (res.user && !user) {
        setUser(res.user);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !pass) {
      setError('Please provide both the email/username and app password.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.updateSmtpConfig({
        service,
        host: service === 'gmail' ? 'smtp.gmail.com' : host,
        port: service === 'gmail' ? 587 : Number(port),
        secure: service === 'gmail' ? false : (Number(port) === 465),
        user,
        pass,
        fromEmail: fromEmail || user
      });

      setMessage(res.message);
      setStatus(res.status);
      if (onConfigSaved) onConfigSaved(res.status);
    } catch (err) {
      setError(err.data?.error || err.message || 'Failed to authenticate with SMTP server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Email & SMTP Delivery Setup</h3>
              <p className="text-[11px] text-slate-500">Enable real OTP delivery to personal Gmail / Outlook inboxes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 pt-4">
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            status?.configured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {status?.configured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className="font-bold">
                Current Status: {status?.configured ? 'Real Inbox Delivery Active' : 'Dev Test Sandbox Active (Ethereal)'}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                {status?.configured 
                  ? `Authenticated with ${status?.provider} (${status?.user}). OTPs land directly in real recipient inboxes.`
                  : 'Without SMTP credentials, OTP emails are simulated on the Ethereal dev webmail and do not reach external mailboxes.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Provider Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setService('gmail');
                  setHost('smtp.gmail.com');
                  setPort(587);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  service === 'gmail' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Gmail (App Password)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setService('custom');
                  setHost('smtp-relay.brevo.com');
                  setPort(587);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  service === 'custom' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Brevo / Custom SMTP</span>
              </button>
            </div>
          </div>

          {/* Gmail Guide Tip */}
          {service === 'gmail' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">💡 Quick Google App Password Guide:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                <li>Go to your <strong>Google Account</strong> &gt; <strong>Security</strong></li>
                <li>Enable <strong>2-Step Verification</strong></li>
                <li>Go to <strong>App Passwords</strong> and generate a 16-letter key</li>
                <li>Paste your Gmail & 16-letter App Password below</li>
              </ol>
            </div>
          )}

          {/* Email / Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {service === 'gmail' ? 'Your Gmail Address' : 'SMTP Username / Login Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                placeholder={service === 'gmail' ? 'youremail@gmail.com' : 'smtp-user@brevo.com'}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password / App Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {service === 'gmail' ? 'Google 16-Character App Password' : 'SMTP Password / API Key'}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                placeholder={service === 'gmail' ? 'xxxx xxxx xxxx xxxx' : '••••••••••••'}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Custom Host & Port if Custom */}
          {service === 'custom' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp-relay.brevo.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {message && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              {message}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{saving ? 'Verifying & Saving...' : 'Save & Enable Real Delivery'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

