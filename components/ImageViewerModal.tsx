
import React from 'react';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
  onDownload: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      <header className="h-20 flex items-center justify-between px-8">
        <button onClick={onDownload} className="p-3 text-white/40 hover:text-white flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Download Asset</span>
        </button>
        <button onClick={onClose} className="p-3 text-white/40 hover:text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      <div className="flex-1 flex items-center justify-center p-8">
        <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl" alt="Full view" />
      </div>
    </div>
  );
};
