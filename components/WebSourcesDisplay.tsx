
import React from 'react';
import { WebSource } from '../types';

interface WebSourcesDisplayProps {
  sources: WebSource[];
  isDark: boolean;
}

export const WebSourcesDisplay: React.FC<WebSourcesDisplayProps> = ({ sources, isDark }) => {
  if (!sources || sources.length === 0) return null;

  // Remove duplicate URLs
  const uniqueSources = sources.reduce((acc: WebSource[], current) => {
    const x = acc.find(item => item.url === current.url);
    if (!x) return acc.concat([current]);
    return acc;
  }, []).slice(0, 6); // Limit to top 6 sources for clean UI

  return (
    <div className="mt-8 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-1 h-4 rounded-full ${isDark ? 'bg-white/40' : 'bg-black/20'}`} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Verified Sources</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {uniqueSources.map((source, idx) => {
          const domain = new URL(source.url).hostname.replace('www.', '');
          return (
            <a 
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/50' 
                  : 'bg-white border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden bg-white border border-zinc-200`}>
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                    className="w-3.5 h-3.5 object-contain" 
                    alt="" 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <svg className="w-3 h-3 text-zinc-400 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 truncate">
                  {domain}
                </span>
              </div>
              <p className={`text-[11px] font-bold leading-tight truncate group-hover:underline ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {source.title}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
};
