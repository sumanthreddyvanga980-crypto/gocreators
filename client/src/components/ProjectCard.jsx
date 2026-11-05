import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileEdit, 
  MoreVertical, 
  Plus, 
  DollarSign, 
  Calendar, 
  Users, 
  MessageSquare, 
  UserPlus, 
  Sliders, 
  Sparkles,
  Calculator
} from 'lucide-react';
import { api } from '../services/api';
import { EditBudgetModal } from './Modals/EditBudgetModal';
import { AddCrewModal } from './Modals/AddCrewModal';
import { ProjectChatModal } from './Modals/ProjectChatModal';

export const ProjectCard = ({ project, onRefresh, onFindCrew }) => {
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Modals
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddCrewModal, setShowAddCrewModal] = useState(false);
  const [showProjectChatModal, setShowProjectChatModal] = useState(false);

  if (!project) return null;

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;

    setSubmitting(true);
    try {
      await api.updateProject(project._id, {
        updateText: newUpdateText.trim(),
        badge: 'Crew Notice'
      });
      setNewUpdateText('');
      setShowAddUpdate(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const spentAmount = project.budget?.spent ?? 2100;
  const totalAmount = project.budget?.total ?? 3000;
  const committedPercent = totalAmount > 0 ? Math.round((spentAmount / totalAmount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            PROJECT:
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {project.title}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              Short Film
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* COMMON CHAT AREA TRIGGER BUTTON */}
          <button
            onClick={() => setShowProjectChatModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Open Common Team Chat Room for Project Members"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Team Room Chat</span>
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-700">
              {project.status} <span className="text-blue-600 font-extrabold">• {project.progress}% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (Matching reference mockup style) */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-700 shadow-sm"
          style={{ width: `${project.progress}%` }}
        />
      </div>

      {/* Recent Updates Section */}
      <div className="mb-5 bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Recent Updates:
          </span>
          <button
            onClick={() => setShowAddUpdate(!showAddUpdate)}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Notice
          </button>
        </div>

        {showAddUpdate && (
          <form onSubmit={handleAddUpdate} className="mb-3 space-y-2">
            <input
              type="text"
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              placeholder="e.g. Color grade session booked for Friday..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUpdate(false)}
                className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
              >
                {submitting ? 'Posting...' : 'Post Notice'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5">
          {project.recentUpdates && project.recentUpdates.slice(0, 2).map((update, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
              {idx === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <FileEdit className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <span>{update.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Crew / Budget / Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        
        {/* Crew Stack with OPERABLE Add Crew Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">Crew:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {project.crew ? `${project.crew.length} Members` : '6 Members'}
              </span>
              <button
                onClick={() => setShowAddCrewModal(true)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {project.crew && project.crew.slice(0, 5).map((member, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer" title={`${member.user?.name || 'Crew'} (${member.role})`}>
                <img
                  src={member.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={member.role}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-xs group-hover:scale-110 transition-transform"
                />
                <span className="text-[9px] font-semibold text-slate-500 mt-1 max-w-[50px] truncate text-center">
                  {member.role || 'Crew'}
                </span>
              </div>
            ))}
            
            {/* Functional Button to Add New Crew Member */}
            <button
              onClick={() => setShowAddCrewModal(true)}
              className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 text-blue-600 hover:text-white flex items-center justify-center text-xs font-bold transition-all shadow-xs"
              title="Add verified creator to this project crew"
            >
              +
            </button>
          </div>
        </div>

        {/* User-Changable Budget with Custom Price Estimation */}
        <div 
          onClick={() => setShowBudgetModal(true)}
          className="p-2 -m-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              <span>Budget Estimation:</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
              <Calculator className="w-3 h-3" />
              Edit Price
            </span>
          </div>

          <div className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
            ${spentAmount.toLocaleString()} <span className="text-slate-400 font-normal">/ ${totalAmount.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {committedPercent}% committed • Click to edit breakdown
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Upcoming:</span>
          </div>
          <div className="text-xs font-bold text-slate-800">
            {project.upcoming?.label || '2 Cast Interviews (Today)'}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            Production scheduled
          </div>
        </div>

      </div>

      {/* Interactive Modals */}
      <EditBudgetModal
        project={project}
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onUpdated={onRefresh}
      />

      <AddCrewModal
        project={project}
        isOpen={showAddCrewModal}
        onClose={() => setShowAddCrewModal(false)}
        onCrewAdded={onRefresh}
      />

      <ProjectChatModal
        project={project}
        isOpen={showProjectChatModal}
        onClose={() => setShowProjectChatModal(false)}
      />

    </div>
  );
};
