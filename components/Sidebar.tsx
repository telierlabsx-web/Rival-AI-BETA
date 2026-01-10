import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ChatSession, UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  userProfile: UserProfile;
  onProfileClick: () => void;
  onGalleryClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  userProfile,
  onProfileClick,
  onGalleryClick
}) => {
  const groupSessionsByDate = () => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const earlier: ChatSession[] = [];

    const sortedSessions = [...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    sortedSessions.forEach(s => {
      if (isToday(s.updatedAt)) today.push(s);
      else if (isYesterday(s.updatedAt)) yesterday.push(s);
      else earlier.push(s);
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupSessionsByDate();

  const isDark = userProfile.theme === 'black' || userProfile.theme === 'slate';
  const bgColor = isDark ? 'bg-zinc-950/50' : 'bg-white';
  const borderColor = isDark ? 'border-zinc-800' : 'border-gray-100';
  const textColor = isDark ? 'text-zinc-100' : 'text-gray-900';

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 w-72 ${bgColor} border-r ${borderColor} backdrop-blur-xl transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}
    >
      <div className={`h-14 flex items-center justify-between px-6 border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <span className={`font-black text-sm tracking-tighter ${textColor}`}>RIVAL</span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-100'}`}>BETA</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 🔥 FIX: Profile & Gallery di atas New Chat */}
      <div className="px-3 pt-4 pb-2 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <button 
            onClick={onProfileClick}
            className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'}`}
          >
            <img src={userProfile.avatar} alt="P" className={`w-7 h-7 rounded-lg border ${borderColor} object-cover`} />
            <div className="text-left flex-1 min-w-0">
              <p className={`text-[10px] font-black truncate ${textColor}`}>{userProfile.name}</p>
            </div>
          </button>
          
          <button 
            onClick={onGalleryClick}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <button 
          onClick={onNewChat}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-6 pb-6 pt-4">
        <SessionGroup title="Hari Ini" items={today} activeId={activeSessionId} onSelect={onSelectSession} onDelete={onDeleteSession} isDark={isDark} />
        <SessionGroup title="Kemarin" items={yesterday} activeId={activeSessionId} onSelect={onSelectSession} onDelete={onDeleteSession} isDark={isDark} />
        <SessionGroup title="Sebelumnya" items={earlier} activeId={activeSessionId} onSelect={onSelectSession} onDelete={onDeleteSession} isDark={isDark} />
      </div>
    </aside>
  );
};

const SessionGroup: React.FC<{ 
  title: string; 
  items: ChatSession[]; 
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
}> = ({ title, items, activeId, onSelect, onDelete, isDark }) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="px-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{title}</h3>
      <div className="space-y-1">
        {items.map(item => {
          const timeText = format(item.updatedAt, 'dd MMM · HH:mm').toUpperCase();

          return (
            <div key={item.id} className="group relative">
              <button 
                onClick={() => onSelect(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex flex-col gap-1.5 ${
                  activeId === item.id 
                    ? (isDark ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-white') 
                    : `hover:bg-zinc-500/10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`
                }`}
              >
                <span className="text-xs font-bold truncate pr-6">{item.title}</span>
                <span className={`text-[8px] font-black tracking-wider ${activeId === item.id ? 'opacity-40' : 'opacity-30'}`}>
                  {timeText}
                </span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 ${isDark ? 'text-zinc-600 hover:text-red-400' : 'text-zinc-400 hover:text-red-600'} opacity-0 group-hover:opacity-100 transition-all rounded-lg`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
