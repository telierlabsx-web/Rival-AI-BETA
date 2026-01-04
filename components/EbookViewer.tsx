
import React, { useState, useEffect } from 'react';
import { EbookData, EbookPage } from '../types';

interface EbookViewerProps {
  ebookData: EbookData;
  isDark: boolean;
  onClose: () => void;
}

export const EbookViewer: React.FC<EbookViewerProps> = ({ ebookData, isDark, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pageCount = ebookData.pages.length;

  const next = () => {
    if (currentPage < pageCount - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimating(false);
      }, 500);
    }
  };
  const prev = () => {
    if (currentPage > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setAnimating(false);
      }, 500);
    }
  };

  const page = ebookData.pages[currentPage];
  const visualUrl = `https://images.unsplash.com/photo-1?auto=format&fit=crop&q=90&w=1920&h=1080&sig=${currentPage}-${encodeURIComponent(ebookData.title)}&query=${encodeURIComponent(page.visualPrompt)}`;

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [currentPage]);

  const renderLayout = (p: EbookPage) => {
    const layout = p.layout || 'split';

    switch (layout) {
      case 'hero':
        return (
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={currentPage === 0 && ebookData.coverImage ? ebookData.coverImage : visualUrl} className="w-full h-full object-cover scale-100" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
            </div>
            <div className="relative z-10 max-w-5xl px-12 text-center">
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <p className="text-white/60 text-[12px] font-black uppercase tracking-[1em] mb-8">GLOBAL INTELLIGENCE PRESENTATION</p>
                <h2 className="text-6xl md:text-[8rem] lg:text-[12rem] font-black uppercase tracking-tighter text-white leading-[0.8] mb-12 italic">
                  {p.title}
                </h2>
                <div className="w-40 h-1 bg-white mx-auto rounded-full mb-12 shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
                <p className="text-xl md:text-3xl text-white/80 font-medium leading-relaxed max-w-3xl mx-auto">
                  {p.content}
                </p>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="w-full h-full relative p-12 bg-black flex flex-col justify-end">
            <div className="absolute inset-0">
              <img src={visualUrl} className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
            <div className="relative z-10 max-w-4xl">
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6 italic">{p.title}</h2>
              <p className="text-xl md:text-3xl text-white/70 font-medium max-w-2xl">{p.content}</p>
            </div>
          </div>
        );

      case 'feature':
        return (
          <div className="w-full h-full flex flex-col md:flex-row bg-[#0a0a0a]">
            <div className="flex-1 p-12 md:p-24 flex flex-col justify-center">
              <div className="mb-12">
                <span className="text-blue-500 font-black text-6xl">0{currentPage + 1}</span>
                <div className="w-20 h-2 bg-blue-500 mt-4 rounded-full" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-8 leading-none">{p.title}</h2>
              <div className={`text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed border-l-4 border-white/10 pl-8 italic`}>
                {p.content}
              </div>
            </div>
            <div className="w-full md:w-[40%] h-1/2 md:h-full relative">
               <img src={visualUrl} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black" />
            </div>
          </div>
        );

      case 'sidebar':
        return (
          <div className="w-full h-full flex flex-col md:flex-row bg-[#080808]">
            <div className="w-full md:w-[45%] h-1/2 md:h-full relative overflow-hidden">
              <img src={visualUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            </div>
            <div className="flex-1 p-12 md:p-24 lg:p-32 flex flex-col justify-center bg-[#0a0a0a]">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight mb-10 leading-[0.9] text-white">
                {p.title}
              </h2>
              <div className="w-24 h-1 bg-blue-500 mb-12" />
              <p className="text-lg md:text-2xl text-zinc-400 font-medium leading-[1.8] max-w-xl italic">
                {p.content}
              </p>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 md:p-24 bg-white">
            <div className="max-w-4xl w-full text-center space-y-12">
               <div className="mx-auto w-24 h-24 rounded-full border-4 border-black flex items-center justify-center text-3xl font-black">
                 {currentPage + 1}
               </div>
               <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">{p.title}</h2>
               <p className="text-2xl text-zinc-500 font-medium leading-[1.8] max-w-2xl mx-auto">{p.content}</p>
               <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
                 <img src={visualUrl} className="w-full h-full object-cover" alt="" />
               </div>
            </div>
          </div>
        );

      case 'split':
      default:
        return (
          <div className="w-full h-full flex flex-col md:flex-row bg-white">
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden border-r border-black/5">
              <img src={visualUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 p-12 md:p-24 lg:p-32 flex flex-col justify-center bg-zinc-50">
              <div className="max-w-2xl">
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 mb-12 block">PRESENTATION SLIDE</p>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-12 text-black">
                  {p.title}
                </h2>
                <p className="text-xl md:text-3xl text-zinc-700 leading-[1.6] font-medium">
                  {p.content}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-700 overflow-hidden font-modern">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-30 blur-[150px] scale-150 pointer-events-none">
        <img src={visualUrl} className="w-full h-full object-cover" alt="" />
      </div>

      <header className="relative z-10 h-28 flex items-center justify-between px-12 lg:px-20">
        <div className="flex items-center gap-8">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl">
            <span className="font-black text-xl italic">R</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase tracking-tight leading-none mb-1">{ebookData.title}</h1>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">GENERATED BY RIVAL • {ebookData.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="bg-white/5 border border-white/10 px-8 py-3 rounded-full hidden lg:flex items-center gap-6">
            <span className="text-[10px] text-white/50 font-black tracking-widest uppercase">
              {currentPage + 1} / {pageCount}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all group"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center px-12 pb-12">
        <div className={`w-full max-w-[1700px] h-full bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 transform ${animating ? 'opacity-0 translate-y-8 scale-[0.98] blur-xl' : 'opacity-100 translate-y-0 scale-100 blur-0'}`}>
          {renderLayout(page)}
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-24 flex justify-between pointer-events-none">
          <button 
            onClick={prev} 
            disabled={currentPage === 0} 
            className={`w-20 h-20 rounded-full bg-black/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all pointer-events-auto backdrop-blur-xl group ${currentPage === 0 ? 'opacity-0 scale-50' : 'opacity-100'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={next} 
            disabled={currentPage === pageCount - 1} 
            className={`w-20 h-20 rounded-full bg-black/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all pointer-events-auto backdrop-blur-xl group ${currentPage === pageCount - 1 ? 'opacity-0 scale-50' : 'opacity-100'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </main>

      <footer className="h-24 px-12 flex items-center justify-center relative z-10">
        <div className="flex gap-4">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => { setAnimating(true); setTimeout(() => { setCurrentPage(i); setAnimating(false); }, 400); }} 
              className={`h-1.5 rounded-full transition-all duration-700 ${i === currentPage ? 'w-20 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'w-4 bg-white/20 hover:bg-white/50'}`} 
            />
          ))}
        </div>
      </footer>
    </div>
  );
};
