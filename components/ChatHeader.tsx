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
          className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
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
          className={`p-2.5 rounded-xl transition-all flex items-center gap-2 border ${isOfflineMode ? 'bg-amber-500 border-amber-500 text-black' : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/5 text-black hover:bg-black/5')}`}
          title={isOfflineMode ? "Aktifkan Cloud AI (Online)" : "Gunakan Local Core (Offline)"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOfflineMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.16 0m-14.15-4.243a13.5 13.5 0 0118.28 0" />
            )}
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
            {isOfflineMode ? 'OFFLINE' : 'ONLINE'}
          </span>
        </button>

        <button 
          onClick={onNewChat} 
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>
  );
};
