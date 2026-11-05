import React, { useState } from 'react';
import { Film, Upload, Play, FileText, Image, X, CheckCircle2, Sparkles, HardDrive } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PortfolioModal = ({ crewMember, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [title, setTitle] = useState('');
  const [rolePlayed, setRolePlayed] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [fileSizeNotice, setFileSizeNotice] = useState('');

  if (!crewMember) return null;

  const isOwner = user && user._id === crewMember._id;
  const portfolioItems = crewMember.portfolio || [];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit. Please upload a smaller video or image.');
      e.target.value = '';
      return;
    }

    setFile(selected);
    const sizeInMB = (selected.size / (1024 * 1024)).toFixed(2);
    setFileSizeNotice(`${selected.name} (${sizeInMB} MB) • Will be compressed to WebP via Sharp backend`);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title);
      formData.append('rolePlayed', rolePlayed || crewMember.role);
      formData.append('description', description);
      formData.append('type', mediaType);

      await api.uploadPortfolio(formData);
      setSuccessMsg('Media uploaded and compressed successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('gallery');
        setTitle('');
        setDescription('');
        setFile(null);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={crewMember.avatar}
              alt={crewMember.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {crewMember.name}'s Portfolio
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold uppercase">
                {crewMember.role} • Past Work & Showreels
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation if user owns the profile */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'gallery' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Showreel & Work ({portfolioItems.length})
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Media</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sharp WebP Optimized</span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {activeTab === 'gallery' ? (
            portfolioItems.length === 0 ? (
              <div className="py-16 text-center">
                <Film className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No Showcase Media Uploaded</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  {isOwner 
                    ? 'Upload your showreels, mood boards, or screenplay samples to impress directors.'
                    : 'This creator has not published public reel samples yet.'}
                </p>
                {isOwner && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Upload First Media
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioItems.map((item, idx) => (
                  <div key={item._id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    
                    {/* Media Display */}
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          poster={item.thumbnail}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                        {item.type}
                      </span>
                    </div>

                    <div className="p-3.5">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[10px] font-semibold text-blue-600">{item.rolePlayed}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )
          ) : (
            /* Upload Form with File Optimization Notice */
            <form onSubmit={handleUpload} className="space-y-4">
              
              {successMsg ? (
                <div className="p-6 text-center text-emerald-600 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto" />
                  <p className="text-xs font-bold">{successMsg}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Automated Compression Pipeline:</span> High-resolution media files are compressed to WebP & 360px lazy-loaded thumbnails to guarantee zero platform lag. Max limit: 15MB.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project / Reel Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Night Street 4K Anamorphic Test"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Role on Set
                      </label>
                      <input
                        type="text"
                        value={rolePlayed}
                        onChange={(e) => setRolePlayed(e.target.value)}
                        placeholder="e.g. Director of Photography"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Media Type
                      </label>
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                      >
                        <option value="image">Still Frame / Production Photo</option>
                        <option value="video">Short Video Clip / Reel (MP4)</option>
                        <option value="script">Screenplay Sample (PDF)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Media File (Max 15MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/mp4,application/pdf"
                      onChange={handleFileChange}
                      required
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fileSizeNotice && (
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">
                        {fileSizeNotice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description / Equipment Notes
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="e.g. Captured on Sony FX3 with Cooke lenses, ISO 800, grade in DaVinci."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gallery')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-40"
                    >
                      {uploading ? 'Compressing & Uploading...' : 'Upload & Optimize'}
                    </button>
                  </div>
                </>
              )}

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

