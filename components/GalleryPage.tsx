
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChatSession, Message, UserProfile } from '../types';

interface GalleryPageProps {
  sessions: ChatSession[];
  profile: UserProfile;
  onBack: () => void;
  onUpdateSessions: (sessions: ChatSession[]) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ sessions, profile, onBack, onUpdateSessions }) => {
  const [filter, setFilter] = useState<'all' | 'visual' | 'code'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Message | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');

  const isDark = profile.theme === 'black' || profile.theme === 'slate';
  const borderColor = isDark ? 'border-zinc-800' : 'border-current/10';

  const allSavedAssets = sessions.flatMap(session => 
    session.messages.filter(m => m.isSaved && (m.imageUrl || m.codeSnippet))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredAssets = allSavedAssets.filter(a => {
    if (filter === 'visual') return !!a.imageUrl;
    if (filter === 'code') return !!a.codeSnippet;
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Hapus dari gallery?')) {
      const updated = sessions.map(s => ({
        ...s,
        messages: s.messages.map(m => m.id === id ? { ...m, isSaved: false } : m)
      }));
      onUpdateSessions(updated);
      if (selectedAsset?.id === id) setSelectedAsset(null);
    }
  };

  const handleDownload = () => {
    if (!selectedAsset) return;

    if (selectedAsset.imageUrl) {
      const link = document.createElement('a');
      link.href = selectedAsset.imageUrl;
      link.download = `rival-visual-${selectedAsset.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (selectedAsset.codeSnippet) {
      const blob = new Blob([selectedAsset.codeSnippet], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rival-code-${selectedAsset.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const prepareIframeContent = (code: string) => {
    if (code.includes('<html')) return code;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="margin:0; padding:20px;">${code}</body>
      </html>
    `;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-inherit relative h-full">
      <div className="max-w-6xl mx-auto px-8 py-16 md:py-24">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-3 -ml-3 hover:bg-current/5 rounded-full transition-all"
              title="Kembali ke Chat"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-1">Rival Assets</p>
              <h2 className="text-3xl font-black uppercase tracking-tight">Gallery</h2>
            </div>
          </div>

          <div className="flex bg-current/5 p-1 rounded-2xl">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="Semua" />
            <FilterBtn active={filter === 'visual'} onClick={() => setFilter('visual')} label="Visual" />
            <FilterBtn active={filter === 'code'} onClick={() => setFilter('code')} label="Koding" />
          </div>
        </header>

        {filteredAssets.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-current/10 rounded-[3rem]">
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-20">Belum ada aset tersimpan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border ${borderColor} transition-all hover:scale-[1.02] cursor-pointer shadow-xl ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
                onClick={() => setSelectedAsset(asset)}
              >
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Asset" />
                ) : (
                  <div className="w-full h-full p-8 flex flex-col justify-center items-center text-center bg-current/5">
                    <svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Development Asset</p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">{format(asset.timestamp, 'dd MMM yyyy')}</p>
                  <h4 className="text-sm text-white font-black uppercase truncate">{asset.content.slice(0, 40)}...</h4>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                  className="absolute top-6 right-6 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
          <header className="h-20 flex items-center justify-between px-8 border-b border-white/10">
            <div className="flex items-center gap-6">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{format(selectedAsset.timestamp, 'PPP')}</p>
            </div>
            
            <div className="flex items-center gap-4">
               {selectedAsset.codeSnippet && (
                 <div className="flex bg-white/5 p-1 rounded-2xl">
                    <button onClick={() => setPreviewMode('code')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${previewMode === 'code' ? 'bg-white text-black' : 'text-white/40'}`}>Code</button>
                    <button onClick={() => setPreviewMode('preview')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${previewMode === 'preview' ? 'bg-white text-black' : 'text-white/40'}`}>Preview</button>
                 </div>
               )}
               
               <button onClick={handleDownload} className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl transition-all flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Download</span>
               </button>

               <button onClick={() => setSelectedAsset(null)} className="p-3 text-white/40 hover:text-white transition-colors">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          </header>

          <div className="flex-1 p-8 md:p-16 overflow-hidden flex items-center justify-center">
            {selectedAsset.imageUrl ? (
              <img src={selectedAsset.imageUrl} className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl" alt="Asset" />
            ) : selectedAsset.codeSnippet && (
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                {previewMode === 'preview' ? (
                  <iframe title="Code Preview" srcDoc={prepareIframeContent(selectedAsset.codeSnippet)} className="w-full h-full bg-white border-none" sandbox="allow-scripts" />
                ) : (
                  <pre className="p-10 text-zinc-300 font-mono text-sm leading-relaxed overflow-auto h-full no-scrollbar"><code>{selectedAsset.codeSnippet}</code></pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'bg-current text-white invert' : 'opacity-40 hover:opacity-100'}`}>{label}</button>
);
