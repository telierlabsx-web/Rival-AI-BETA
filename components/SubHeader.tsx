
import React from 'react';

interface SubHeaderProps {
  title: string;
  onBack: () => void;
}

export const SubHeader: React.FC<SubHeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center gap-6 mb-12">
      <button 
        onClick={onBack} 
        className="p-3 -ml-3 hover:bg-current/5 rounded-full transition-all group active:scale-90"
      >
        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
    </div>
  );
};
