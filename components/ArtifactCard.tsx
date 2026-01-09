import React, { useState } from 'react';
import { format } from 'date-fns';

interface ArtifactCardProps {
  code: string;
  timestamp: Date;
  isDark: boolean;
  borderColor: string;
  onOpen: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  code,
  timestamp,
  isDark,
  borderColor,
  onOpen
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const detectLanguage = (): string => {
    if (code.includes('<!DOCTYPE html>') || code.includes('<html')) return 'HTML';
    if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'JavaScript';
    if (code.includes('def ') || code.includes('import ')) return 'Python';
    if (code.includes('interface') || code.includes('type ')) return 'TypeScript';
    return 'Code';
  };

  const language = detectLanguage();
  const lineCount = code.split('\n').length;

  return (
    <div className="mt-8 max-w-2xl">
      <div className={`rounded-3xl border ${borderColor} ${isDark ? 'bg-zinc-900/50 backdrop-blur-xl' : 'bg-white shadow-xl'} overflow-hidden`}>
        
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-center`}>
              <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                {language} Application
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {lineCount} lines • {format(timestamp, 'HH:mm')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : (isDark ? 'hover:bg-white/10' : 'hover:bg-black/5')}`}
              title="Copy code"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>

            <button
              onClick={handleDownload}
              className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              title="Download code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <button 
            onClick={onOpen}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest group shadow-lg ${
              isDark 
                ? 'bg-white text-black hover:bg-zinc-100 hover:shadow-white/20' 
                : 'bg-black text-white hover:bg-zinc-800 hover:shadow-black/20'
            }`}
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Preview Application
          </button>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-black/5 text-zinc-600'}`}>
              Live Preview
            </span>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-black/5 text-zinc-600'}`}>
              Ready to Use
            </span>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-black/5 text-zinc-600'}`}>
              Production Code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
