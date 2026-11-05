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
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-200 bg-white h-[calc(100vh-61px)] sticky top-[61px] p-4 select-none overflow-y-auto">
      
      {/* Category & Crew Search Input in Sidebar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={genreSearch}
            onChange={(e) => handleSidebarSearchChange(e.target.value)}
            placeholder="Search roles (e.g. writers, DOP)"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          {genreSearch && (
            <button
              onClick={() => handleSidebarSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sections (Projects & Inbox) */}
      <div className="space-y-1 mb-5">
        <button
          onClick={() => setActiveTab('projects')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-4 h-4 text-blue-500" />
            <span>PROJECTS</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            activeTab === 'projects' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            3 Active
          </span>
        </button>

        <button
          onClick={onOpenInbox}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'inbox'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4 text-orange-500" />
            <span>INBOX</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">
            {pendingRequestsCount > 0 ? `${pendingRequestsCount} New` : '4 New'}
          </span>
        </button>
      </div>

      {/* CREW GENRES (Category filters as specified in requirement 3) */}
      <div className="mb-5 flex-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            CREW GENRES
          </span>
          <Users className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-0.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredGenres.length === 0 ? (
            <div className="text-[11px] text-slate-400 py-3 text-center">
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
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span className="truncate">{genre.label}</span>
                  </div>
                  {talentCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
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
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety Moderation</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900">
            15 Rule
          </span>
        </button>
      </div>

      {/* Bottom Dock: GOCRATERS AI ASSISTANT Quick Widget */}
      <div className="pt-3 border-t border-slate-100">
        <div 
          onClick={onOpenAi}
          className="bg-slate-900 text-white rounded-2xl p-3 cursor-pointer hover:bg-slate-800 transition-all shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold tracking-wide text-slate-200">
                GOCRATERS AI
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mb-1.5">
            "Suggest 3 unique visual approaches for the diner scene"
          </p>

          <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold group-hover:text-blue-300">
            <span>Ask Crew Guide</span>
            <Zap className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

    </aside>
  );
};
