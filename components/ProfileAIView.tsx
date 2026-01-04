
import React from 'react';
import { UserProfile } from '../types';

interface ProfileAIViewProps {
  state: UserProfile;
  onUpdateState: (updated: UserProfile) => void;
  onBack: () => void;
  onAvatarClick: () => void;
}

export const ProfileAIView: React.FC<ProfileAIViewProps> = ({ 
  state, 
  onUpdateState, 
  onBack,
  onAvatarClick
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-400">
      <div>
        <div className="flex flex-col gap-6">
          <div className="relative group w-32 h-32">
            <img 
              src={state.aiAvatar} 
              className="w-full h-full rounded-[2.5rem] object-cover border border-current/10 shadow-2xl transition-transform group-hover:scale-[1.02]" 
              alt="AI" 
            />
          </div>
          <button 
            onClick={onAvatarClick} 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-left opacity-30 hover:opacity-100 transition-opacity"
          >
            UNGGAH FOTO RIVAL BARU
          </button>
        </div>
        
        <div className="space-y-10 mt-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 block">NAMA SISTEM</label>
            <input 
              type="text" 
              value={state.aiName}
              onChange={(e) => onUpdateState({ ...state, aiName: e.target.value })}
              className="w-full bg-current/[0.02] border border-current/5 py-5 px-8 rounded-[1.5rem] focus:outline-none text-base font-black tracking-tight focus:border-current/20 transition-all shadow-sm" 
              placeholder="Masukkan nama AI..."
            />
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 block">PERSONA & INSTRUKSI</label>
            <textarea 
              rows={10}
              value={state.aiPersona}
              onChange={(e) => onUpdateState({ ...state, aiPersona: e.target.value })}
              placeholder="Tuliskan bagaimana Rival harus bersikap..."
              className="w-full bg-current/[0.02] p-8 rounded-[2.5rem] border border-current/5 focus:outline-none text-sm font-medium leading-relaxed focus:border-current/20 transition-all shadow-sm resize-none" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
