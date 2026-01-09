import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData } from '../types';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapDisplayProps {
  mapData: MapData;
  isDark: boolean;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ mapData, isDark }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map - DARK MODE & 1:1 ASPECT RATIO
    const map = L.map(mapRef.current, {
      center: [mapData.latitude || 0, mapData.longitude || 0],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    // 🌙 DARK TILE LAYER (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom RED marker
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="position: absolute; top: -40px; left: -20px; width: 40px; height: 40px; background: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 20px rgba(239, 68, 68, 0.6);"></div>
          <div style="position: absolute; top: -32px; left: -12px; width: 24px; height: 24px; background: white; border-radius: 50%; transform: rotate(-45deg);"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    // Add marker
    L.marker([mapData.latitude || 0, mapData.longitude || 0], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong style="color: #000;">${mapData.title}</strong><br/><span style="color: #666;">${mapData.location}</span>`);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapData, isDark]);

  const openInMaps = () => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${mapData.latitude}&mlon=${mapData.longitude}#map=15/${mapData.latitude}/${mapData.longitude}`,
      '_blank'
    );
  };

  return (
    <div className="mt-8 max-w-2xl w-full group animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 🔥 MAP CONTAINER - 1:1 ASPECT RATIO (SQUARE) */}
      <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.01] active:scale-[0.98]">
        
        {/* Leaflet Map */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Top Right Button */}
        <button
          onClick={openInMaps}
          className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-black/80 transition-all z-[1000]"
        >
          View larger map
        </button>

        {/* Bottom Left Label */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3 z-[1000]">
          <div 
            onClick={openInMaps}
            className="bg-black/70 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl cursor-pointer hover:bg-black/90 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-black uppercase tracking-tight">{mapData.title}</p>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">Buka di OpenStreetMap</p>
            </div>
          </div>
        </div>

        {/* Bottom Right Attribution */}
        <div className="absolute bottom-6 right-8 opacity-40 z-[1000]">
          <p className="text-[10px] font-bold text-white tracking-tighter">OpenStreetMap</p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-4 px-2 flex justify-between items-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Map Data ©2025 OpenStreetMap</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Rival Intelligence Platform</p>
      </div>
    </div>
  );
};
