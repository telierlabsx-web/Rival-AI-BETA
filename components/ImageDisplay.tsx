
import React from 'react';

interface ImageDisplayProps {
  imageUrl: string;
  borderColor: string;
  onView: () => void;
  onDownload: () => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, borderColor, onView, onDownload }) => {
  return (
    <div className="mt-8 group relative max-w-xl">
      <img 
        src={imageUrl} 
        className={`rounded-[2.5rem] border ${borderColor} shadow-2xl w-full aspect-square object-cover cursor-zoom-in transition-transform group-hover:scale-[1.01]`}
        alt="Generated Visual"
        onClick={onView}
      />
      <button 
        onClick={onDownload}
        className="absolute top-6 right-6 p-4 bg-black/50 backdrop-blur-xl text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </div>
  );
};
