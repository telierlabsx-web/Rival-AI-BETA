
import React, { useState } from 'react';

interface ArtifactModalProps {
  code: string;
  onClose: () => void;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({ code, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const prepareIframeContent = (code: string) => {
    const isHtml = code.trim().startsWith('<');
    
    return `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!-- Essential CDNs for High-Quality Apps -->
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { font-family: 'Plus Jakarta Sans', sans-serif; }
            body { margin: 0; padding: 0; background: #fafafa; min-height: 100vh; }
            .artifact-root { min-height: 100vh; display: flex; flex-direction: column; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="artifact-root">
            ${isHtml ? code : `<div id="app"></div><script>${code}</script>`}
          </div>
          <script>
            // Auto-initialize Lucide icons
            lucide.createIcons();
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
      <header className="h-20 flex items-center justify-between px-8 border-b border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-2xl shadow-inner border border-white/5">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'preview' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'}`}
            >
              Hasil Eksekusi
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'code' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'}`}
            >
              Logika Sistem
            </button>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center">
          <h3 className="text-sm text-white font-black uppercase tracking-tight">Rival Engineering Hub</h3>
          <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Live Deployment Environment</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 text-white/40 hover:text-white transition-all hover:rotate-90 hover:scale-110 active:scale-90"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'preview' ? (
          <div className="w-full h-full p-4 md:p-8 lg:p-12">
            <div className="w-full h-full bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">
              <iframe 
                title="Artifact Preview"
                srcDoc={prepareIframeContent(code)}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-4 md:p-8 lg:p-12 flex flex-col">
            <div className="flex-1 bg-[#050505] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="h-14 bg-white/5 px-8 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Compiler Engine v2.0</span>
                <button 
                  className="text-[10px] text-white/60 hover:text-white font-black uppercase tracking-widest flex items-center gap-2 group" 
                  onClick={() => { navigator.clipboard.writeText(code); alert("Logika disalin!"); }}
                >
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy Logic
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-10 text-sm font-mono text-zinc-400 leading-relaxed no-scrollbar selection:bg-white selection:text-black">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
