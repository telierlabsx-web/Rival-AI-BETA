
import React from 'react';
import { ConversationMode } from '../types';

interface EmptyStateProps {
  aiAvatar: string;
  activeMode: ConversationMode;
  isDark: boolean;
  borderColor: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ aiAvatar, activeMode, isDark, borderColor }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center animate-in fade-in duration-1000">
      <div className={`w-28 h-28 md:w-40 md:h-40 rounded-[3rem] overflow-hidden mb-8 shadow-2xl border ${borderColor} transition-transform hover:scale-105 duration-700`}>
        <img src={aiAvatar} className="w-full h-full object-cover" alt="AI Avatar" />
      </div>
      {/* Seluruh teks bantuan dihapus sesuai request user untuk menjaga estetika minimalis */}
      <div className="w-12 h-1 bg-current opacity-10 rounded-full" />
    </div>
  );
};
