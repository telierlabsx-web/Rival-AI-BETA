import React from 'react';

interface ChatHeaderProps {
  sessionTitle: string;
  isDark: boolean;
  isOfflineMode: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onToggleOffline: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  sessionTitle, 
  isDark, 
  isOfflineMode,
  onToggleSidebar, 
  onNewChat,
  onToggleOffline
}) => {
  const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const hasMultipleKeys = (process.env.API_KEY || '').includes(',');

  return (
    <header className={`h-16 border-b ${borderColor} flex items-center justify-between px-4 md:px-8 gap-4 sticky top-0 bg-inherit/95 backdrop-blur-xl z-20`}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button 
          onClick={onToggleSidebar} 
          className={`p-2 -ml-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16" />
          </svg>
        </button>
        <div className="flex items-center gap-4 min-w-0">
          <h2 className={`text-sm font-black truncate uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            {isOfflineMode && <span className="text-amber-500 mr-2">[OFFLINE]</span>}
            {sessionTitle}
          </h2>
          {hasMultipleKeys && !isOfflineMode && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Multi-Core Active</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleOffline}
          className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
          title={isOfflineMode ? "Aktifkan Cloud AI (Online)" : "Gunakan Local Core (Offline)"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOfflineMode ? (
              // Icon Offline: Laptop/Computer Local
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            ) : (
              // Icon Online: Cloud dengan centang
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </button>

        <button 
          onClick={onNewChat} 
          className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>
  );
};
