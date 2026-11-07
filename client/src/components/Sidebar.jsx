import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Inbox, 
  Users, 
  Camera, 
  Smile, 
  Clapperboard, 
  PenTool, 
  Mic2, 
  Scissors, 
  Palette, 
  Briefcase,
  Zap,
  Sparkles, 
  Search,
  ShieldCheck,
  Wand2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ALL_CREW_GENRES = [
  { id: 'all', label: 'All Crew', icon: Users },
  { id: 'cinematographer', label: 'Cinematographers', icon: Camera },
  { id: 'actor', label: 'Actors', icon: Smile },
  { id: 'director', label: 'Directors', icon: Clapperboard },
  { id: 'scriptwriter', label: 'Writers', icon: PenTool },
  { id: 'sound_mixer', label: 'Sound Mixers', icon: Mic2 },
  { id: 'editor', label: 'Editors', icon: Scissors },
  { id: 'art_director', label: 'Art Directors', icon: Palette },
  { id: 'producer', label: 'Producers', icon: Briefcase },
  { id: 'lighting_gaffer', label: 'Lighting / Gaffers', icon: Zap },
  { id: 'vfx_artist', label: 'VFX / Colorists', icon: Wand2 }
];

export const Sidebar = ({ 
  selectedCategory, 
  onSelectCategory, 
  activeTab, 
  setActiveTab, 
  onOpenAi,
  onOpenInbox,
  onOpenModeration,
  onOpenAddProject,
  searchQuery,
  onSearchChange
}) => {
  const { pendingRequestsCount } = useAuth();
  const [genreSearch, setGenreSearch] = useState('');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const c = await api.getCategoryCounts();
        setCounts(c);
      } catch {
        // fallback
      }
    };
    fetchCounts();
  }, [selectedCategory]);

  const filteredGenres = ALL_CREW_GENRES.filter(genre => 
    genre.label.toLowerCase().includes(genreSearch.toLowerCase()) ||
    genre.id.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const handleSidebarSearchChange = (val) => {
    setGenreSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-[#0B0F19] h-[calc(100vh-61px)] sticky top-[61px] p-4 select-none overflow-y-auto">
      
      {/* Category & Crew Search Input in Sidebar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={genreSearch}
            onChange={(e) => handleSidebarSearchChange(e.target.value)}
            placeholder="Search roles (e.g. writers, DOP)"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-[#111827] transition-all"
          />
          {genreSearch && (
            <button
              onClick={() => handleSidebarSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sections (Projects & Inbox) */}
      <div className="space-y-1.5 mb-5">
        <button
          onClick={() => setActiveTab('projects')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderKanban className={`w-4 h-4 ${activeTab === 'projects' ? 'text-black' : 'text-amber-400'}`} />
            <span>PROJECTS</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'projects' ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-300'
          }`}>
            3 Active
          </span>
        </button>

        <button
          onClick={onOpenInbox}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inbox'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4 text-orange-400" />
            <span>INBOX</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-black font-black">
            {pendingRequestsCount > 0 ? `${pendingRequestsCount} New` : '4 New'}
          </span>
        </button>
      </div>

      {/* CREW GENRES (Category filters as specified in requirement 3) */}
      <div className="mb-5 flex-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold tracking-wider text-amber-400/90 uppercase flex items-center gap-1.5">
            <span>CREW GENRES</span>
          </span>
          <Users className="w-3.5 h-3.5 text-slate-500" />
        </div>

        <div className="space-y-0.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredGenres.length === 0 ? (
            <div className="text-[11px] text-slate-500 py-3 text-center">
              No matching category.
            </div>
          ) : (
            filteredGenres.map((genre) => {
              const Icon = genre.icon;
              const isSelected = selectedCategory === genre.id;
              const talentCount = genre.id === 'all' 
                ? (counts.all || 18) 
                : (counts[genre.id] || 0);

              return (
                <button
                  key={genre.id}
                  onClick={() => {
                    onSelectCategory(genre.id);
                    setActiveTab('discovery');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span className="truncate">{genre.label}</span>
                  </div>
                  {talentCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {talentCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Safety & Moderation Shortcut */}
      <div className="mb-4">
        <button
          onClick={onOpenModeration}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-950/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Moderation</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">
            15 Rule
          </span>
        </button>
      </div>

      {/* Bottom Dock: GOCREATORS AI ASSISTANT Quick Widget */}
      <div className="pt-3 border-t border-slate-800/80">
        <div 
          onClick={onOpenAi}
          className="bg-[#111827] text-white rounded-2xl p-3 cursor-pointer hover:bg-slate-800/90 transition-all shadow-md group relative overflow-hidden border border-slate-800 hover:border-amber-500/30"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold tracking-wide text-slate-100">
                GOCREATORS AI
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mb-1.5">
            "Suggest 3 unique visual approaches for the diner scene"
          </p>

          <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold group-hover:text-amber-300">
            <span>Ask Crew Guide</span>
            <Zap className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

    </aside>
  );
};
