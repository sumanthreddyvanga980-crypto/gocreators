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
    Cinematographer: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Actor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Director: 'bg-amber-50 text-amber-700 border-amber-200',
    Scriptwriter: 'bg-purple-50 text-purple-700 border-purple-200',
    'Sound Mixer': 'bg-blue-50 text-blue-700 border-blue-200',
    Editor: 'bg-rose-50 text-rose-700 border-rose-200',
    'Art Director': 'bg-orange-50 text-orange-700 border-orange-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const copyPhoneNumber = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
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
              className="text-[9px] font-mono font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer transition-colors"
              title="Click to copy Creator ID"
            >
              ID: {crewMember.creatorId}
            </span>
          )}
        </div>

        {/* Privacy Masking Badge */}
        {isConnected ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Unlock className="w-3 h-3 text-emerald-600" />
            Personal Data Unmasked
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full" title="Personal phone and photo are masked until connection is accepted.">
            <Lock className="w-3 h-3 text-slate-400" />
            Masked Profile
          </span>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start gap-3.5 mb-3">
        {/* Avatar Container with Conditional Masking */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow-sm relative group-hover:scale-105 transition-transform">
            <img
              src={crewMember.avatar}
              alt={crewMember.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                !isConnected ? 'blur-xs scale-105' : 'blur-none'
              }`}
            />
            {/* If masked, overlay privacy shield */}
            {!isConnected && (
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
          </div>

          {isConnected && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Active Connection" />
          )}
        </div>

        {/* Name and Location */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
            {crewMember.name}
            {isSelf && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-semibold">You</span>
            )}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{crewMember.location}</span>
          </div>

          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            {crewMember.experience}
          </div>
        </div>
      </div>

      {/* Bio snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
        {crewMember.bio || 'Cinema creator ready for collaboration on short films and creative visual productions.'}
      </p>

      {/* Equipment / Skills Tags */}
      {crewMember.equipment && crewMember.equipment.length > 0 && (
        <div className="mb-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <Camera className="w-3 h-3 text-slate-400" />
            <span>Kit & Gear:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {crewMember.equipment.slice(0, 3).map((item, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
              >
                {item}
              </span>
            ))}
            {crewMember.equipment.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center pl-1">
                +{crewMember.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* SENSITIVE DATA ZONE: Phone Number (Demonstrates Strict Masking) */}
      <div className={`p-2.5 rounded-xl mb-4 border transition-colors ${
        isConnected 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : 'bg-slate-50 border-dashed border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Phone className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="font-mono font-medium text-[11px]">
              {crewMember.phone}
            </span>
          </div>

          {isConnected ? (
            <button
              onClick={() => copyPhoneNumber(crewMember.phone)}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs"
            >
              {copiedPhone ? 'Copied!' : 'Copy'}
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Hidden</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        
        {/* Main Connect / Message Button */}
        {isSelf ? (
          <div className="flex-1 text-center py-1.5 text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl">
            Your Profile
          </div>
        ) : isConnected ? (
          <button
            onClick={() => onChat(crewMember)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Unlocked</span>
          </button>
        ) : isPendingSent ? (
          <button
            disabled
            className="flex-1 py-2 px-3 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed"
          >
            Request Pending
          </button>
        ) : isPendingReceived ? (
          <button
            onClick={() => onConnect(crewMember)}
            className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs animate-pulse"
          >
            Respond to Request
          </button>
        ) : (
          <button
            onClick={() => onConnect(crewMember)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Send className="w-3 h-3" />
            <span>Connect to Reveal</span>
          </button>
        )}

        {/* Portfolio Button */}
        <button
          onClick={() => onViewPortfolio(crewMember)}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="View Work Portfolio"
        >
          <Film className="w-4 h-4" />
        </button>

        {/* Community Moderation Report Button */}
        {!isSelf && (
          <button
            onClick={() => onReport(crewMember)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            title={`Report Profile (${crewMember.reports || 0}/15 Reports recorded)`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
  );
};

