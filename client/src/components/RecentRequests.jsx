import React, { useState } from 'react';
import { MessageSquarePlus, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const TIMELINE_POINTS = ['Jan 19', 'Aug 20', 'Sep 19', 'Apr 20', 'Oct 29', 'Dec 29'];

export const RecentRequests = ({ requests = [], onRefresh }) => {
  const [selectedTimeline, setSelectedTimeline] = useState('Sep 19');
  const [activeFeedbackModal, setActiveFeedbackModal] = useState(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const defaultRequests = requests.length > 0 ? requests : [
    {
      _id: 'req1',
      title: 'Script Draft - Scene 12',
      category: 'Short Film',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      status: 'Pending'
    },
    {
      _id: 'req2',
      title: 'Diner Set Design',
      category: 'Sher Set',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      status: 'Pending'
    }
  ];

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!activeFeedbackModal) return;

    setSubmitting(true);
    try {
      await api.submitFeedback(activeFeedbackModal._id, feedbackNotes);
      setSuccessMsg(`Feedback submitted for ${activeFeedbackModal.title}!`);
      setTimeout(() => {
        setSuccessMsg('');
        setActiveFeedbackModal(null);
        setFeedbackNotes('');
        if (onRefresh) onRefresh();
      }, 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          Recent Requests
        </h3>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Production Reviews
        </span>
      </div>

      {/* Requests List matching screenshot layout */}
      <div className="space-y-3 mb-5">
        {defaultRequests.map((req, idx) => (
          <div 
            key={req._id || idx}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <img
                src={req.avatar || req.createdBy?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={req.title}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                  {req.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {req.category}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveFeedbackModal(req)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                idx === 0 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Submit Feedback
            </button>
          </div>
        ))}
      </div>

      {/* Timeline matching screenshot */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2 px-1">
          {TIMELINE_POINTS.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedTimeline(date)}
              className={`hover:text-blue-600 transition-colors ${
                selectedTimeline === date ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        {/* Timeline Slider Track */}
        <div className="relative w-full h-1.5 bg-slate-100 rounded-full">
          <div 
            className="absolute top-0 left-[35%] w-16 h-1.5 bg-blue-600 rounded-full"
            title="Current Production Milestone: Sep 19"
          />
        </div>
      </div>

      {/* Feedback Submission Modal */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Feedback: {activeFeedbackModal.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Share notes, pacing critiques, or approve this production milestone.
            </p>

            {successMsg ? (
              <div className="py-6 flex flex-col items-center justify-center text-center text-emerald-600 gap-2">
                <Check className="w-8 h-8 bg-emerald-100 rounded-full p-1.5" />
                <span className="text-xs font-bold">{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  rows={4}
                  required
                  placeholder="e.g. Dialogue in Scene 12 flows much better. Recommend tightening the transition into the diner interior..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveFeedbackModal(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

