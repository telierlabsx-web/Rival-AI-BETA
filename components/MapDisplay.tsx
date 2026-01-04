
import React from 'react';
import { MapData } from '../types';

interface MapDisplayProps {
  mapData: MapData;
  isDark: boolean;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ mapData, isDark }) => {
  const mapUrl = mapData.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapData.title)}`;

  return (
    <div className="mt-8 max-w-2xl w-full group animate-in fade-in slide-in-from-bottom-4 duration-500">
      <a 
        href={mapUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.01] active:scale-[0.98]"
      >
        {/* Map Background Layer - Dark Stylized */}
        <div className="absolute inset-0 bg-[#0a0a0a]">
          {/* Decorative Map Pattern (SVG Grid) */}
          <svg className="absolute inset-0 w-full h-full opacity-20" width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Random "Streets" lines for map feel */}
            <path d="M0 50 Q 200 80 400 20 T 800 150" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M100 0 L 150 400" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2" />
            <path d="M0 250 L 800 200" stroke="white" strokeWidth="0.8" fill="none" opacity="0.2" />
          </svg>
          
          {/* Subtle Glow in Center */}
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent" />
        </div>

        {/* Center Location Pin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Ripple Effect */}
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Top Right "View larger map" button (Fake UI to look real) */}
        <div className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60">
          View larger map
        </div>

        {/* Bottom Left Label - EXACTLY LIKE SCREENSHOT */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-black uppercase tracking-tight">{mapData.title}</p>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">Buka di Google Maps</p>
            </div>
          </div>
        </div>

        {/* Bottom Right Google Logo (Small Detail) */}
        <div className="absolute bottom-6 right-8 opacity-40">
           <p className="text-[10px] font-bold text-white tracking-tighter">Google</p>
        </div>
      </a>
      
      {/* Contextual Description below the card */}
      <div className="mt-4 px-2 flex justify-between items-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Map Data ©2025 Google</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Rival Intelligence Platform</p>
      </div>
    </div>
  );
};
