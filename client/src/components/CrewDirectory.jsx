import React, { useState } from 'react';
import { Search, Filter, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, X, SlidersHorizontal, Tag, UserCheck } from 'lucide-react';
import { CrewCard } from './CrewCard';

const CATEGORIES = [
  { id: 'all', label: 'All Crew' },
  { id: 'cinematographer', label: 'Cinematographer' },
  { id: 'actor', label: 'Actor' },
  { id: 'director', label: 'Director' },
  { id: 'scriptwriter', label: 'Scriptwriter' },
  { id: 'sound_mixer', label: 'Sound Mixer' },
  { id: 'editor', label: 'Editor' },
  { id: 'art_director', label: 'Art Director' },
  { id: 'producer', label: 'Producer' },
  { id: 'lighting_gaffer', label: 'Lighting / Gaffer' },
  { id: 'vfx_artist', label: 'VFX / Colorist' }
];

export const CrewDirectory = ({
  crew = [],
  loading,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  onConnect,
  onReport,
  onViewPortfolio,
  onChat,
  onRefresh
}) => {
  return (
    <div className="space-y-5">
      
      {/* Category & Dedicated Crew Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        
        {/* Top title and Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Cinema Crew Directory</span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Zero-Lag Indexed Search
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal contact details & unmasked photos are conditionally unlocked upon accepted connection.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
              {crew.length} {crew.length === 1 ? 'Creator' : 'Creators'} Available
            </span>
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Refresh directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* DUAL SEARCH SYSTEM: DEDICATED APP-GENERATED ID SEARCH + ROLE/SKILL SEARCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          
          {/* BAR 1: DEDICATED CANDIDATE APP-GENERATED ID SEARCH */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Search Candidate by App-Generated ID</span>
              </span>
              <span className="text-[10px] font-mono text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Format: GC-XXX-0000
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery.startsWith('GC-') || searchQuery.startsWith('gc-') ? searchQuery : ''}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="e.g. GC-DOP-8841, GC-DIR-1024..."
                className="w-full pl-3.5 pr-20 py-2 text-xs font-mono font-bold bg-blue-50/60 hover:bg-blue-50 focus:bg-white border-2 border-blue-200 focus:border-blue-600 rounded-xl text-blue-950 placeholder-slate-400 outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {(searchQuery.startsWith('GC-') || searchQuery.startsWith('gc-')) && searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full text-xs"
                    title="Clear ID search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  ID Search
                </span>
              </div>
            </div>
            {/* Quick Sample IDs */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap pt-0.5">
              <span className="font-semibold text-slate-500">Quick IDs:</span>
              {['GC-DOP-8841', 'GC-DIR-1024', 'GC-ACT-7762', 'GC-WRI-3390'].map((sampleId) => (
                <button
                  key={sampleId}
                  onClick={() => setSearchQuery(sampleId)}
                  className={`font-mono px-2 py-0.5 rounded border transition-colors ${
                    searchQuery === sampleId 
                      ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {sampleId}
                </button>
              ))}
            </div>
          </div>

          {/* BAR 2: ROLE / KEYWORD / GEAR SEARCH */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search by Role, Gear, Name or Skills</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={!searchQuery.startsWith('GC-') && !searchQuery.startsWith('gc-') ? searchQuery : ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. writers, directors, Sony FX3, RED, fight choreo..."
                className="w-full pl-3.5 pr-20 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all font-medium"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {!searchQuery.startsWith('GC-') && !searchQuery.startsWith('gc-') && searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full text-xs"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  Role / Skill
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Instantly finds matching crew even if filtered under a different category tab.
            </p>
          </div>

        </div>

        {/* Filter Pills with instant one-click switching */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search / Filter status indicator */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Filtered by:{' '}
                {selectedCategory !== 'all' && (
                  <span className="font-bold text-slate-800 uppercase mr-1">
                    [{selectedCategory}]
                  </span>
                )}
                {searchQuery && (
                  <span>
                    Query: <span className="font-semibold text-blue-600">"{searchQuery}"</span>
                  </span>
                )}
              </span>
            </div>

            <button
              onClick={() => {
                onSelectCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>

      {/* Crew Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : crew.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No Crew Members Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No talent matches "{searchQuery || selectedCategory}". Try searching another cinema role like "writers", "directors", "sound", "lighting", or reset filters.
          </p>
          <button
            onClick={() => {
              onSelectCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {crew.map((member) => (
            <CrewCard
              key={member._id}
              crewMember={member}
              onConnect={onConnect}
              onReport={onReport}
              onViewPortfolio={onViewPortfolio}
              onChat={onChat}
            />
          ))}
        </div>
      )}

    </div>
  );
};
