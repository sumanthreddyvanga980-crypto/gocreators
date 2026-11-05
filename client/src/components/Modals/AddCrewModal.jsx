import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Check, X, Camera, Film, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const AddCrewModal = ({ project, isOpen, onClose, onCrewAdded }) => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [assignedRole, setAssignedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.getCrew({ limit: 40 });
      setCandidates(data.crew || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  // Filter out candidates already in project crew
  const existingCrewIds = (project.crew || []).map(c => c.user?._id || c.user);
  
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !search.trim() || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      (c.creatorId && c.creatorId.toLowerCase().includes(search.toLowerCase())) ||
      (c.equipment && c.equipment.some(e => e.toLowerCase().includes(search.toLowerCase())));
    return matchesSearch;
  });

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setAssignedRole(candidate.role);
  };

  const handleAddCrewMember = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setSubmitting(true);
    try {
      const res = await api.addProjectCrew(project._id, selectedCandidate._id, assignedRole);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedCandidate(null);
        if (onCrewAdded) onCrewAdded();
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add Crew Member to {project.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                Search verified talent and assign them to your production
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Candidates Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, role, Creator ID (e.g. GC-DOP-8841)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
          />
        </div>

        {/* Candidate Selection List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin mb-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading verified talent...</div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No candidates match your search.</div>
          ) : (
            filteredCandidates.map((candidate) => {
              const isSelected = selectedCandidate?._id === candidate._id;
              const alreadyInCrew = existingCrewIds.includes(candidate._id);

              return (
                <div
                  key={candidate._id}
                  onClick={() => handleSelectCandidate(candidate)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20' 
                      : alreadyInCrew
                      ? 'bg-slate-50/50 border-slate-200 opacity-70'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{candidate.name}</h4>
                        {candidate.creatorId && (
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            {candidate.creatorId}
                          </span>
                        )}
                        {alreadyInCrew && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                            Already on Crew
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-600 font-semibold">{candidate.role} • {candidate.location}</p>
                      {candidate.equipment && candidate.equipment.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate">
                          Gear: {candidate.equipment.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Candidate Role Assignment */}
        {selectedCandidate && (
          <form onSubmit={handleAddCrewMember} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Selected: <span className="text-blue-600">{selectedCandidate.name}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedCandidate.creatorId}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Assign Project Role
              </label>
              <input
                type="text"
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                required
                placeholder="e.g. Lead Cinematographer, Steadicam Operator, Script Doctor"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Clear Selection
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {submitting ? 'Adding...' : successMsg ? 'Added!' : '+ Add to Project Crew'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

