
import React, { useState } from 'react';
import { offlineService } from '../services/offlineService';

interface OfflineDownloadPopupProps {
  onDownload: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export const OfflineDownloadPopup: React.FC<OfflineDownloadPopupProps> = ({ onDownload, onCancel, isDark }) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await offlineService.init((p) => setProgress(p));
      // Jika tidak dibatalkan di tengah jalan
      if (!offlineService.isWorking() && offlineService.isReady()) {
        onDownload();
      }
    } catch (err) {
      setIsDownloading(false);
      setError("Gagal mengunduh model. Cek koneksi internet Anda.");
    }
  };

  const handleAbort = () => {
    offlineService.cancelInit();
    setIsDownloading(false);
    setProgress(0);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
      <div className={`max-w-md w-full p-10 rounded-[3rem] border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'} shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300`}>
        {!isDownloading ? (
          <>
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-center mb-4">Aktifkan Rival Offline?</h3>
            <p className="text-sm font-medium opacity-40 leading-relaxed text-center mb-6">
              Unduh <span className="text-current font-black">LOCAL CORE v1.0 (~450 MB)</span>. 
              Model ini akan disimpan di browser Anda sehingga Rival tetap berfungsi tanpa internet.
            </p>
            
            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center mb-4">{error}</p>}

            <div className="flex flex-col gap-3">
              <button 
                onClick={startDownload}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                Unduh AI Offline Sekarang
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
              >
                Mungkin Nanti
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-12">Mengunduh Intelligence...</h4>
            <div className="w-full h-2 bg-current/5 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
              <span>{Math.round(progress)}% COMPLETED</span>
              <span>{(progress * 4.5).toFixed(1)} MB / 450 MB</span>
            </div>
            
            <button 
              onClick={handleAbort}
              className="mt-12 w-full py-4 border border-current/10 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-red-500 hover:border-red-500/30 transition-all"
            >
              Batalkan Pengunduhan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
