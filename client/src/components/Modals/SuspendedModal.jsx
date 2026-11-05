import React from 'react';
import { Ban, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SuspendedModal = () => {
  const { isBlockedAlert, setIsBlockedAlert, logout, loginWithDemo } = useAuth();

  if (!isBlockedAlert) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-center animate-in zoom-in-95">
        
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
          <Ban className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">
          Account Suspended by Moderation
        </h3>

        <div className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-3">
          15-Report Threshold Triggered
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {isBlockedAlert.error || isBlockedAlert.reason || 'This account has exceeded 15 community safety reports and has been automatically suspended in accordance with our Cinema Safety Protocols.'}
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 mb-5 text-left">
          <div className="font-bold text-slate-700 mb-1">Enforced Restrictions:</div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Public directory listing suppressed</li>
            <li>Connection requests deactivated</li>
            <li>Direct messaging gateway restricted</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => loginWithDemo('jane@gocreators.io')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to Active Persona (Jane - Director)</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Log Out Completely
          </button>
        </div>

      </div>
    </div>
  );
};

