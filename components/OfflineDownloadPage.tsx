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
    <div className="h-screen w-full bg-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        
        {/* FOTO BUKU dengan shadow gelap */}
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-8">
          <img 
            src="/394b781ebdc6d13d92ccc84cdfe49cf5.jpg"
            alt="Rival AI"
            className="w-full h-full object-cover"
          />
          {/* Shadow overlay gelap untuk area tombol */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* JUDUL SINGKAT di dalam foto */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
              RIVAL AI
            </h1>
            <p className="text-sm font-bold text-white/60 uppercase tracking-wider">
              Offline Mode
            </p>
          </div>
        </div>

        {!isDownloading ? (
          <div className="space-y-3">
            {/* TOMBOL DOWNLOAD */}
            <button 
              onClick={startDownload}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              DOWNLOAD AI OFFLINE 279MB
            </button>
            
            {/* TOMBOL NANTI AJA */}
            <button 
              onClick={onSkip}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              NANTI AJA
            </button>
          </div>
        ) : (
          <div>
            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm font-bold text-white/60 mb-6">
              <span>{Math.round(progress)}%</span>
              <span>{((progress / 100) * MODEL_SIZE_MB).toFixed(0)} / {MODEL_SIZE_MB} MB</span>
            </div>

            {/* Cancel Button */}
            <button 
              onClick={handleAbort}
              className="w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-wider border border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-all"
            >
              Batalkan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
