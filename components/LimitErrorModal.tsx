
import React from 'react';

interface LimitErrorModalProps {
  isDark: boolean;
  borderColor: string;
  onClose: () => void;
}

export const LimitErrorModal: React.FC<LimitErrorModalProps> = ({ isDark, borderColor, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
      <div className={`max-w-md w-full p-10 rounded-[2.5rem] border ${borderColor} ${isDark ? 'bg-zinc-950 shadow-black' : 'bg-white shadow-xl'} animate-in zoom-in-95 duration-200`}>
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Sistem Terlimitasi</h3>
        <p className="text-sm font-medium opacity-40 leading-relaxed mb-10">
          Anda telah mencapai batas harian untuk visual generation. Tingkatkan paket ke Pro atau Ultimate untuk mendapatkan akses tak terbatas.
        </p>
        <button 
          onClick={onClose}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};
