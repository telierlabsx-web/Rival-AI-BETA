
import React, { useState } from 'react';
import { ConversationMode } from '../types';

interface ModeSelectorProps {
  activeMode: ConversationMode;
  setActiveMode: (mode: ConversationMode) => void;
  isDark: boolean;
  compact?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, setActiveMode, isDark, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const modes: { id: ConversationMode; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { id: 'visual', label: 'Visual', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'code', label: 'Code', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> }
  ];

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === mode.id ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-black/5')}`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3.5 rounded-2xl transition-all flex items-center gap-2 ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
      >
        {modes.find(m => m.id === activeMode)?.icon}
      </button>

      {isOpen && (
        <div className={`absolute bottom-full left-0 mb-4 p-2 rounded-2xl shadow-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} w-40 animate-in fade-in slide-in-from-bottom-2`}>
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => { setActiveMode(mode.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === mode.id ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-black/5')}`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
