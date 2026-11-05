import React, { useState } from 'react';
import { Search, Sparkles, Bell, Shield, Film, User, LogOut, ChevronDown, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export const Navbar = ({ onOpenAi, onOpenNotifications, onOpenAuth, onOpenModeration, onOpenSmtp }) => {
  const { user, logout, loginWithDemo, pendingRequestsCount } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Film className="w-4 h-4" />
          </div>
          <span className="font-extrabold tracking-wider text-xl text-slate-900 font-sans flex items-center">
            GO<span className="text-blue-600">CRATERS</span>
          </span>
          <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Cinema Net
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* AI Assistant Button (Styled like reference mockup) */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all"
            title="Open GoCreators AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-200" />
            <span className="tracking-wide">GOCRATERS AI</span>
          </button>

          {/* Safety & Moderation Center Trigger */}
          <button
            onClick={onOpenModeration}
            className="p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors relative"
            title="Automated Moderation & Safety Center"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Real Email / SMTP Settings Trigger */}
          <button
            onClick={onOpenSmtp}
            className="p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors relative"
            title="Configure Real Email OTP Delivery (Gmail / SMTP)"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Notifications Bell with unread counter */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors relative"
            title="Connection Requests & Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* User Profile / Account Switcher */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all text-left"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-blue-600 font-semibold uppercase">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && user && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified {user.role}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Phone: <span className="font-mono text-slate-800">{user.phone}</span>
                  </div>
                </div>

                {/* Fast Switch Account for Pair Programming & Testing */}
                <div className="py-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Quick Persona Switcher
                  </div>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={(e) => {
                        e.stopPropagation();
                        loginWithDemo(acc.email);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        user.email === acc.email
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {user.email === acc.email && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={onOpenAuth}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Register / Switch Account
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

