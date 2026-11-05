import React, { useState } from 'react';
import { FolderPlus, X, DollarSign, Calendar, Clapperboard } from 'lucide-react';
import { api } from '../../services/api';

export const AddProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [budgetTotal, setBudgetTotal] = useState(3500);
  const [budgetSpent, setBudgetSpent] = useState(800);
  const [upcomingLabel, setUpcomingLabel] = useState('Camera Package Rental & Tests');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await api.createProject({
        title: title.trim(),
        subtitle: subtitle.trim() || 'Indie Short Film / Reel',
        status: 'Active',
        progress: 15,
        budget: {
          spent: Number(budgetSpent) || 0,
          total: Number(budgetTotal) || 3000
        },
        upcoming: {
          count: 1,
          label: upcomingLabel
        }
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clapperboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Create Cinema Project
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. NEON DRIFT"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none uppercase font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Genre & Logline
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Cyberpunk Action Short Film (12 mins)"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Spent Budget ($)
              </label>
              <input
                type="number"
                value={budgetSpent}
                onChange={(e) => setBudgetSpent(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Budget ($)
              </label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Immediate Milestone / Upcoming Event
            </label>
            <input
              type="text"
              value={upcomingLabel}
              onChange={(e) => setUpcomingLabel(e.target.value)}
              placeholder="e.g. Audition Callbacks (Tomorrow)"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            >
              {submitting ? 'Creating...' : 'Initialize Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

