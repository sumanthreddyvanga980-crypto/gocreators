import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Phone, 
  ShieldAlert, 
  Send, 
  Check, 
  ExternalLink, 
  Film, 
  MapPin, 
  Award, 
  MessageSquare,
  Sparkles,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CrewCard = ({ 
  crewMember, 
  onConnect, 
  onReport, 
  onViewPortfolio, 
  onChat 
}) => {
  const { user } = useAuth();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const isConnected = crewMember.connectionStatus === 'connected' || crewMember.connectionStatus === 'self';
  const isPendingSent = crewMember.connectionStatus === 'pending_sent';
  const isPendingReceived = crewMember.connectionStatus === 'pending_received';
  const isSelf = crewMember.connectionStatus === 'self';

  const roleColors = {
    Cinematographer: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Actor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Director: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Scriptwriter: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Sound Mixer': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Editor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'Art Director': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    default: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const copyPhoneNumber = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800/90 hover:border-amber-500/50 p-5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-slate-100">
      
      {/* Privacy Status Ribbon & App-Generated Creator ID */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            roleColors[crewMember.role] || roleColors.default
          }`}>
            {crewMember.role}
          </span>
          {crewMember.creatorId && (
            <span 
              onClick={() => {
                navigator.clipboard.writeText(crewMember.creatorId);
                alert(`Copied Creator ID: ${crewMember.creatorId}`);
              }}
              className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer transition-colors"
              title="Click to copy Creator ID"
            >
              ID: {crewMember.creatorId}
            </span>
          )}
        </div>

        {/* Privacy Masking Badge */}
        {isConnected ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            <Unlock className="w-3 h-3 text-emerald-400" />
            Personal Data Unmasked
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full" title="Personal phone and photo are masked until connection is accepted.">
            <Lock className="w-3 h-3 text-slate-500" />
            Masked Profile
          </span>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start gap-3.5 mb-3">
        {/* Avatar Container with Conditional Masking */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-800 shadow-md relative group-hover:scale-105 transition-transform">
            <img
              src={crewMember.avatar}
              alt={crewMember.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                !isConnected ? 'blur-xs scale-105' : 'blur-none'
              }`}
            />
            {/* If masked, overlay privacy shield */}
            {!isConnected && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
          </div>

          {isConnected && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111827] rounded-full" title="Active Connection" />
          )}
        </div>

        {/* Name and Location */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white truncate flex items-center gap-1.5">
            {crewMember.name}
            {isSelf && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 rounded font-bold">You</span>
            )}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{crewMember.location}</span>
          </div>

          <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
            {crewMember.experience}
          </div>
        </div>
      </div>

      {/* Bio snippet */}
      <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
        {crewMember.bio || 'Cinema creator ready for collaboration on short films and creative visual productions.'}
      </p>

      {/* Equipment / Skills Tags */}
      {crewMember.equipment && crewMember.equipment.length > 0 && (
        <div className="mb-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <Camera className="w-3 h-3 text-amber-400" />
            <span>Kit & Gear:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {crewMember.equipment.slice(0, 3).map((item, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
              >
                {item}
              </span>
            ))}
            {crewMember.equipment.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center pl-1">
                +{crewMember.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* SENSITIVE DATA ZONE: Phone Number (Demonstrates Strict Masking) */}
      <div className={`p-2.5 rounded-xl mb-4 border transition-colors ${
        isConnected 
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200' 
          : 'bg-slate-900/80 border-dashed border-slate-800 text-slate-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Phone className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="font-mono font-medium text-[11px]">
              {crewMember.phone}
            </span>
          </div>

          {isConnected ? (
            <button
              onClick={() => copyPhoneNumber(crewMember.phone)}
              className="text-[10px] font-bold text-emerald-300 hover:text-white bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700 shadow-2xs"
            >
              {copiedPhone ? 'Copied!' : 'Copy'}
            </button>
          ) : (
            <span className="text-[10px] text-slate-500 italic">Hidden</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        
        {/* Main Connect / Message Button */}
        {isSelf ? (
          <div className="flex-1 text-center py-1.5 text-xs text-slate-500 font-semibold bg-slate-900 rounded-xl border border-slate-800">
            Your Profile
          </div>
        ) : isConnected ? (
          <button
            onClick={() => onChat(crewMember)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-amber-500/40 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Chat Unlocked</span>
          </button>
        ) : isPendingSent ? (
          <button
            disabled
            className="flex-1 py-2 px-3 bg-slate-900 text-slate-500 text-xs font-semibold rounded-xl cursor-not-allowed border border-slate-800"
          >
            Request Pending
          </button>
        ) : isPendingReceived ? (
          <button
            onClick={() => onConnect(crewMember)}
            className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-black text-xs font-black rounded-xl shadow-md shadow-orange-500/20 animate-pulse"
          >
            Respond to Request
          </button>
        ) : (
          <button
            onClick={() => onConnect(crewMember)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Send className="w-3 h-3 stroke-[2.5]" />
            <span>Connect to Reveal</span>
          </button>
        )}

        {/* Portfolio Button */}
        <button
          onClick={() => onViewPortfolio(crewMember)}
          className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="View Work Portfolio"
        >
          <Film className="w-4 h-4" />
        </button>

        {/* Community Moderation Report Button */}
        {!isSelf && (
          <button
            onClick={() => onReport(crewMember)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/50 transition-colors"
            title={`Report Profile (${crewMember.reports || 0}/15 Reports recorded)`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
  );
};

