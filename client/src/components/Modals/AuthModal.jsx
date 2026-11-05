import React, { useState, useMemo, useEffect } from 'react';
import { 
  Film, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  ShieldCheck,
  Send,
  RefreshCw,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SmtpSettingsModal } from './SmtpSettingsModal';

const CINEMA_ROLES = [
  'Cinematographer',
  'Actor',
  'Director',
  'Scriptwriter',
  'Sound Mixer',
  'Editor',
  'Producer',
  'Art Director',
  'Lighting / Gaffer',
  'VFX Artist'
];

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, loginWithDemo } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cinematographer');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Los Angeles, CA');
  const [experience, setExperience] = useState('Professional (4-7 yrs)');
  const [bio, setBio] = useState('');
  const [equipment, setEquipment] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // Email OTP verification states (to prevent fake account entries)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpAlert, setOtpAlert] = useState(null);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check SMTP status on modal open
  useEffect(() => {
    if (isOpen) {
      api.getSmtpStatus().then(setSmtpStatus).catch(() => {});
    }
  }, [isOpen]);

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.upper) score++;
    if (passwordCriteria.lower) score++;
    if (passwordCriteria.number) score++;
    if (passwordCriteria.special) score++;
    return score;
  }, [passwordCriteria]);

  const isPasswordStrongEnough = passwordScore >= 4;

  if (!isOpen) return null;

  // Send OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError('');
    setOtpSending(true);
    try {
      const res = await api.sendOtp(email);
      setOtpSent(true);
      setOtpAlert({
        message: res.message,
        deliveryMode: res.deliveryMode,
        inboxUrl: res.inboxUrl,
        devOtpPreview: res.devOtpPreview
      });
      // Refresh status in case it changed
      api.getSmtpStatus().then(setSmtpStatus).catch(() => {});
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setError('');
    setOtpVerifying(true);
    try {
      await api.verifyOtp(email, otpCode);
      setIsEmailVerified(true);
      setOtpAlert(null);
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError('Email verification required! Please request and verify your OTP to prevent fake account entries.');
      return;
    }

    if (!isPasswordStrongEnough) {
      setError('Please meet the minimum password strength criteria before proceeding.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('experience', experience);
      formData.append('bio', bio);
      formData.append('equipment', equipment);
      formData.append('skills', skills);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await register(formData);
      onClose();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Welcome to Go Creators' : 'Join as Cinema Talent'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'login' ? 'Secure cinema networking & crew discovery' : 'Verified Cinema Registration & Portfolios'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Creator Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jane@gocreators.io"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Go Creators'}
              </button>

              {/* Quick Persona Switcher for convenient testing */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                  Demo Fast Sign-In:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        loginWithDemo(acc.email);
                        onClose();
                      }}
                      className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all"
                    >
                      <div className="text-xs font-bold text-slate-800">{acc.name}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{acc.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Screenplay Credit
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Christopher Nolan"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              {/* EMAIL & OTP VERIFICATION SECTION (ANTI-FAKE ACCOUNTS) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Email & OTP Verification</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowSmtpModal(true)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                        smtpStatus?.configured 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      title="Configure real Gmail or custom SMTP delivery"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{smtpStatus?.configured ? 'Real SMTP Active' : 'Setup Real Gmail'}</span>
                    </button>
                    {isEmailVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailVerified(false);
                      setOtpSent(false);
                    }}
                    disabled={isEmailVerified}
                    required
                    placeholder="creator@filmstudio.com"
                    className="flex-1 text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {!isEmailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !email}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpSending ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}</span>
                    </button>
                  )}
                </div>

                {/* Email Sent Notification */}
                {otpAlert && (
                  otpAlert.deliveryMode === 'smtp_live' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <p className="font-bold text-emerald-950">Dispatched Directly to Your Gmail/Email Inbox!</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          A 6-digit code has been delivered to <strong>{email}</strong> via SMTP. Please check your inbox (and spam folder), then enter the code below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2 animate-in fade-in">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <p className="font-bold text-amber-950">Dev Test Mailbox Active (Ethereal)</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Because SMTP credentials are not yet saved, this verification email was routed to the test outbox. For delivery straight to your personal Gmail inbox, click below to connect Gmail.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {otpAlert.inboxUrl && (
                          <a
                            href={otpAlert.inboxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Dispatched Email in Webmail</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowSmtpModal(true)}
                          className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-amber-700" />
                          <span>Connect Real Gmail SMTP</span>
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* 6-Digit Code Input */}
                {otpSent && !isEmailVerified && (
                  <div className="flex gap-2 items-center pt-1 animate-in fade-in">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 text-xs font-mono font-bold tracking-widest text-center p-2 border-2 border-blue-400 rounded-xl outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpCode.length !== 6}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40"
                    >
                      {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                )}
              </div>

              {/* PASSWORD & STRENGTH METER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Account Password
                  </label>
                  {password && (
                    <span className={`text-[10px] font-bold uppercase ${
                      passwordScore <= 2 ? 'text-rose-600' : passwordScore <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {passwordScore <= 2 ? 'Weak' : passwordScore <= 3 ? 'Fair' : passwordScore === 4 ? 'Good' : 'Strong'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 8 chars, uppercase, number & symbol"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Strength Meter Bar */}
                {password && (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordScore >= 1 ? (passwordScore <= 2 ? 'bg-rose-500' : passwordScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordScore >= 2 ? (passwordScore <= 2 ? 'bg-rose-500' : passwordScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordScore >= 3 ? (passwordScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordScore >= 5 ? 'bg-emerald-600' : 'bg-slate-200'
                      }`} />
                    </div>

                    {/* Criteria Ticks */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                      <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-700 font-semibold' : ''}`}>
                        <span>{passwordCriteria.length ? '✓' : '○'} 8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.upper ? 'text-emerald-700 font-semibold' : ''}`}>
                        <span>{passwordCriteria.upper ? '✓' : '○'} Uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.lower ? 'text-emerald-700 font-semibold' : ''}`}>
                        <span>{passwordCriteria.lower ? '✓' : '○'} Lowercase (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-700 font-semibold' : ''}`}>
                        <span>{passwordCriteria.number ? '✓' : '○'} At least 1 number</span>
                      </div>
                      <div className={`flex items-center gap-1 col-span-2 ${passwordCriteria.special ? 'text-emerald-700 font-semibold' : ''}`}>
                        <span>{passwordCriteria.special ? '✓' : '○'} Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role & Experience */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cinema Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  >
                    {CINEMA_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  >
                    <option value="Indie (1-3 yrs)">Indie (1-3 yrs)</option>
                    <option value="Professional (4-7 yrs)">Professional (4-7 yrs)</option>
                    <option value="Veteran (8+ yrs)">Veteran (8+ yrs)</option>
                  </select>
                </div>
              </div>

              {/* Phone with Privacy Notice */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number (Confidential)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Masked by default
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 (555) 019-2831"
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-mono"
                />
              </div>

              {/* Location & Avatar */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Los Angeles, CA"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-slate-100"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Equipment / Gear (comma separated)
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Sony FX3, RED V-Raptor, DaVinci Resolve, Anamorphic"
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cinema Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell directors and collaborators about your filmmaking background..."
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isEmailVerified || !isPasswordStrongEnough}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Creating Verified Account...' : !isEmailVerified ? 'Verify Email with OTP to Register' : !isPasswordStrongEnough ? 'Password Too Weak' : 'Complete Verified Registration'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* SMTP Email Delivery Setup Modal */}
      <SmtpSettingsModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
        onConfigSaved={(status) => setSmtpStatus(status)}
      />
    </div>
  );
};
