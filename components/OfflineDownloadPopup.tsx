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

  const MODEL_SIZE_MB = 297; // Qwen2.5-0.5B size

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
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div 
        className={`
          max-w-lg w-full rounded-3xl overflow-hidden
          ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}
          shadow-[0_20px_80px_rgba(0,0,0,0.4)]
          animate-in zoom-in-95 duration-300
        `}
      >
        {/* GIF ANIMASI + SHADOW */}
        <div className="relative w-full aspect-video overflow-hidden">
          <img 
            src="/9bb026a1d486b5c6a801322f1ec3edb5.gif"
            alt="AI Offline Animation"
            className="w-full h-full object-cover"
          />
          {/* Shadow gradient di bawah GIF */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="p-8">
          {!isDownloading ? (
            <>
              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    RIVAL OFFLINE CORE
                  </h3>
                  <p className="text-xs font-bold opacity-50 uppercase tracking-wider">
                    Qwen2.5-0.5B-Instruct
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className={`
                p-4 rounded-2xl mb-6
                ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-100'}
              `}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="font-black">Chat Tanpa Internet</span> – Real Local Inference
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="font-black">100% Privasi</span> – Semua Data di Perangkat Anda
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold opacity-40 text-center mb-6 uppercase tracking-wider">
                Ukuran Paket: ~{MODEL_SIZE_MB} MB
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-xs font-bold text-red-500 text-center uppercase tracking-wide">
                    {error}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={startDownload}
                  className={`
                    w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                    transition-all transform hover:scale-[1.02] active:scale-[0.98]
                    ${isDark 
                      ? 'bg-white text-black hover:bg-zinc-100 shadow-lg shadow-white/20' 
                      : 'bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/20'
                    }
                  `}
                >
                  UNDUH PAKET OFFLINE SEKARANG
                </button>
                
                <button 
                  onClick={onCancel}
                  className="
                    w-full py-3 text-xs font-black uppercase tracking-widest
                    opacity-40 hover:opacity-100 transition-all
                  "
                >
                  Mungkin Nanti
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Downloading State */}
              <div className="text-center">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-8 opacity-80">
                  Mengunduh Intelligence...
                </h4>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-zinc-800/30 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`
                      h-full transition-all duration-500 ease-out
                      ${isDark 
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600' 
                        : 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600'
                      }
                    `}
                    style={{ width: `${progress}%` }}
                  />
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{ 
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>

                {/* Progress Stats */}
                <div className="flex justify-between items-center mb-8">
                  <div className="text-left">
                    <p className="text-2xl font-black tabular-nums">
                      {Math.round(progress)}%
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Selesai
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums">
                      {((progress / 100) * MODEL_SIZE_MB).toFixed(1)} MB
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      dari {MODEL_SIZE_MB} MB
                    </p>
                  </div>
                </div>

                {/* Cancel Button */}
                <button 
                  onClick={handleAbort}
                  className={`
                    w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest
                    transition-all border
                    ${isDark
                      ? 'border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
                      : 'border-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600'
                    }
                  `}
                >
                  Batalkan Pengunduhan
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
