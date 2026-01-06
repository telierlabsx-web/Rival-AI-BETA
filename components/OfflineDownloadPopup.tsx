import React, { useState } from 'react';
import { offlineService } from '../services/offlineService';

interface OfflineDownloadPopupProps {
  onDownload: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export const OfflineDownloadPopup: React.FC<OfflineDownloadPopupProps> = ({ 
  onDownload, 
  onCancel, 
  isDark 
}) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MODEL_SIZE_MB = 297;

  const startDownload = async () => {
    setIsDownloading(true);
    setError(null);
    setProgress(0);
    
    try {
      await offlineService.init((p) => setProgress(p * 100));
      
      if (!offlineService.isWorking() && offlineService.isReady()) {
        onDownload();
      }
    } catch (err) {
      setIsDownloading(false);
      setError("Gagal mengunduh model. Cek koneksi internet Anda.");
      console.error(err);
    }
  };

  const handleAbort = () => {
    offlineService.cancelInit();
    setIsDownloading(false);
    setProgress(0);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* GIF ANIMASI - FULL WIDTH */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-6 shadow-2xl">
          <img 
            src="/9bb026a1d486b5c6a801322f1ec3edb5.gif"
            alt="AI Animation"
            className="w-full h-full object-cover"
          />
          {/* Shadow gradient di bawah */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {!isDownloading ? (
          <>
            {/* INFO TEXT */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                RIVAL OFFLINE CORE
              </h3>
              <p className="text-xs font-bold opacity-40 uppercase tracking-wider mb-4">
                Qwen2.5-0.5B • {MODEL_SIZE_MB} MB
              </p>
              
              <div className="flex flex-col gap-2 text-xs font-semibold opacity-60">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <span>Chat Tanpa Internet</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <span>100% Privasi Lokal</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <p className="text-xs font-bold text-red-500 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* TOMBOL DOWNLOAD */}
            <button 
              onClick={startDownload}
              className={`
                w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider
                transition-all transform hover:scale-[1.02] active:scale-[0.98]
                mb-3
                ${isDark 
                  ? 'bg-white text-black hover:bg-zinc-100' 
                  : 'bg-black text-white hover:bg-zinc-800'
                }
              `}
            >
              UNDUH PAKET OFFLINE
            </button>
            
            {/* TOMBOL CANCEL */}
            <button 
              onClick={onCancel}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider opacity-40 hover:opacity-100 transition-opacity"
            >
              Nanti Saja
            </button>
          </>
        ) : (
          <>
            {/* DOWNLOADING STATE */}
            <div className="text-center">
              <h4 className="text-sm font-black uppercase tracking-widest mb-6 opacity-70">
                Mengunduh Model AI...
              </h4>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div 
                  className={`
                    h-full transition-all duration-500
                    ${isDark ? 'bg-white' : 'bg-black'}
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-xs font-bold opacity-50 mb-8">
                <span>{Math.round(progress)}%</span>
                <span>{((progress / 100) * MODEL_SIZE_MB).toFixed(1)} / {MODEL_SIZE_MB} MB</span>
              </div>

              {/* Cancel Button */}
              <button 
                onClick={handleAbort}
                className={`
                  w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider
                  transition-all border opacity-50 hover:opacity-100
                  ${isDark ? 'border-white/20 hover:border-red-500/50' : 'border-black/20 hover:border-red-500/50'}
                `}
              >
                Batalkan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
