import React, { useState } from 'react';
import { offlineService } from '../services/offlineService';

interface OfflineDownloadPageProps {
  onDownload: () => void;
  onSkip: () => void;
}

export const OfflineDownloadPage: React.FC<OfflineDownloadPageProps> = ({ 
  onDownload, 
  onSkip 
}) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const MODEL_SIZE_MB = 279;

  const startDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    
    try {
      await offlineService.init((p) => setProgress(p * 100));
      
      if (!offlineService.isWorking() && offlineService.isReady()) {
        onDownload();
      }
    } catch (err) {
      setIsDownloading(false);
      console.error(err);
    }
  };

  const handleAbort = () => {
    offlineService.cancelInit();
    setIsDownloading(false);
    setProgress(0);
    onSkip();
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* FOTO FULL LAYAR dengan shadow */}
      <div className="absolute inset-0">
        <img 
          src="/394b781ebdc6d13d92ccc84cdfe49cf5.jpg"
          alt="Rival AI"
          className="w-full h-full object-cover"
        />
        {/* Shadow overlay gelap dari bawah ke atas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* KONTEN di atas foto */}
      <div className="relative h-full flex flex-col items-center justify-end pb-12 px-6">
        
        {/* JUDUL */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
            RIVAL AI
          </h1>
          <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
            Offline Mode
          </p>
        </div>

        {!isDownloading ? (
          <div className="w-full max-w-sm space-y-3">
            {/* TOMBOL DOWNLOAD - LEBIH KECIL */}
            <button 
              onClick={startDownload}
              className="w-full py-3.5 px-6 rounded-full font-black text-xs uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              DOWNLOAD AI OFFLINE 279MB
            </button>
            
            {/* TOMBOL NANTI AJA - LEBIH KECIL */}
            <button 
              onClick={onSkip}
              className="w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              NANTI AJA
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs font-bold text-white/50 mb-6">
              <span>{Math.round(progress)}%</span>
              <span>{((progress / 100) * MODEL_SIZE_MB).toFixed(0)} / {MODEL_SIZE_MB} MB</span>
            </div>

            {/* Cancel Button */}
            <button 
              onClick={handleAbort}
              className="w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 text-white/40 hover:text-white hover:border-white/50 transition-all"
            >
              Batalkan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
