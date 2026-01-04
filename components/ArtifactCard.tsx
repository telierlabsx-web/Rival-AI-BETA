
import React from 'react';
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
  return (
    <div className="mt-8 max-w-xl">
      <div className={`p-6 rounded-3xl border ${borderColor} ${isDark ? 'bg-zinc-950/50' : 'bg-white shadow-xl shadow-black/5'} overflow-hidden`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-current/5 flex items-center justify-center border border-current/10">
            <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">Web Artifact</h3>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-0.5">
              Application v1.0 • {format(timestamp, 'HH:mm')}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onOpen}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group shadow-lg ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Preview
        </button>
      </div>
    </div>
  );
};
