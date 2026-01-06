import React, { useRef, useState, useEffect } from 'react';
import { ConversationMode } from '../types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  selectedImages: string[] | null;
  setSelectedImages: (value: string[] | null) => void;
  activeMode: ConversationMode;
  setActiveMode: (mode: ConversationMode) => void;
  isDark: boolean;
  theme: string; // TAMBAH THEME
  onSend: () => void;
  autoFocus?: boolean; // TAMBAH AUTO FOCUS
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  selectedImages,
  setSelectedImages,
  activeMode,
  setActiveMode,
  isDark,
  theme,
  onSend,
  autoFocus = false
}) => {
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AUTO FOCUS setelah skip offline page
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10) as File[];
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(results => {
        setSelectedImages(results);
      });
    }
    e.target.value = '';
    setIsAttachmentOpen(false);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImages([result]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
    setIsAttachmentOpen(false);
  };

  // DYNAMIC COLORS PER THEME
  const getThemeColors = () => {
    switch(theme) {
      case 'black':
        return {
          bg: 'bg-zinc-950',
          border: 'border-zinc-800',
          text: 'text-white',
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-white/5',
          activeBg: 'bg-white',
          activeText: 'text-black',
          menuBg: 'bg-zinc-900',
          menuBorder: 'border-zinc-800'
        };
      case 'slate':
        return {
          bg: 'bg-zinc-900',
          border: 'border-zinc-700',
          text: 'text-white',
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-white/5',
          activeBg: 'bg-white',
          activeText: 'text-black',
          menuBg: 'bg-zinc-800',
          menuBorder: 'border-zinc-700'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-950',
          textMuted: 'text-blue-600',
          hover: 'hover:bg-blue-100',
          activeBg: 'bg-blue-600',
          activeText: 'text-white',
          menuBg: 'bg-white',
          menuBorder: 'border-blue-200'
        };
      case 'cream':
        return {
          bg: 'bg-[#faf8f4]',
          border: 'border-[#e8e3d8]',
          text: 'text-[#2a2520]',
          textMuted: 'text-[#6b5d52]',
          hover: 'hover:bg-[#f0ebe0]',
          activeBg: 'bg-[#2a2520]',
          activeText: 'text-[#faf8f4]',
          menuBg: 'bg-white',
          menuBorder: 'border-[#e8e3d8]'
        };
      default: // white
        return {
          bg: 'bg-white',
          border: 'border-zinc-200',
          text: 'text-black',
          textMuted: 'text-zinc-600',
          hover: 'hover:bg-zinc-50',
          activeBg: 'bg-black',
          activeText: 'text-white',
          menuBg: 'bg-white',
          menuBorder: 'border-zinc-200'
        };
    }
  };

  const colors = getThemeColors();

  const getModeLabel = (mode: ConversationMode) => {
    switch(mode) {
      case 'thinking': return 'Rival 1.0 Thinking';
      case 'cosmic': return 'Cosmic';
      case 'canvas': return 'Canvas';
      default: return 'Rival 1.0 Thinking';
    }
  };

  const getModeIcon = (mode: ConversationMode) => {
    switch(mode) {
      case 'cosmic':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'canvas':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-inherit via-inherit/98 to-transparent pointer-events-none">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto space-y-4">
        
        {/* SUPER RIVAL UPGRADE - KAYAK GROK */}
        <div className={`flex items-center justify-between px-5 py-3 rounded-[24px] ${colors.menuBg} border ${colors.menuBorder} shadow-lg`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <div className={`text-xs font-black uppercase tracking-wider ${colors.text}`}>SuperRival</div>
              <div className={`text-[10px] ${colors.textMuted}`}>Unlock advanced features</div>
            </div>
          </div>
          <button className={`px-4 py-2 rounded-full ${colors.activeBg} ${colors.activeText} text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform`}>
            Upgrade
          </button>
        </div>

        {/* MODE SELECTOR - KAYAK GROK */}
        <div className="relative">
          <button
            onClick={() => setIsModeOpen(!isModeOpen)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-[24px] ${colors.menuBg} border ${colors.menuBorder} shadow-lg ${colors.hover} transition-all`}
          >
            <div className="flex items-center gap-3">
              {getModeIcon(activeMode)}
              <span className={`text-sm font-bold ${colors.text}`}>{getModeLabel(activeMode)}</span>
            </div>
            <svg className={`w-5 h-5 ${colors.text} transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isModeOpen && (
            <div className={`absolute bottom-full left-0 right-0 mb-2 p-2 rounded-[24px] ${colors.menuBg} border ${colors.menuBorder} shadow-2xl animate-in fade-in slide-in-from-bottom-2`}>
              <button
                onClick={() => { setActiveMode('thinking'); setIsModeOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[20px] ${activeMode === 'thinking' ? `${colors.activeBg} ${colors.activeText}` : colors.hover} transition-all`}
              >
                {getModeIcon('thinking')}
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">Rival 1.0 Thinking</div>
                  <div className={`text-[10px] ${activeMode === 'thinking' ? 'opacity-70' : colors.textMuted}`}>Thinks fast</div>
                </div>
                {activeMode === 'thinking' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => { setActiveMode('cosmic'); setIsModeOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[20px] ${activeMode === 'cosmic' ? `${colors.activeBg} ${colors.activeText}` : colors.hover} transition-all`}
              >
                {getModeIcon('cosmic')}
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">Cosmic</div>
                  <div className={`text-[10px] ${activeMode === 'cosmic' ? 'opacity-70' : colors.textMuted}`}>Deep conversations</div>
                </div>
                {activeMode === 'cosmic' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => { setActiveMode('canvas'); setIsModeOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[20px] ${activeMode === 'canvas' ? `${colors.activeBg} ${colors.activeText}` : colors.hover} transition-all`}
              >
                {getModeIcon('canvas')}
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">Canvas</div>
                  <div className={`text-[10px] ${activeMode === 'canvas' ? 'opacity-70' : colors.textMuted}`}>Coding & review</div>
                </div>
                {activeMode === 'canvas' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SELECTED IMAGES PREVIEW */}
        {selectedImages && selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap animate-in fade-in slide-in-from-bottom-2">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  className={`w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl border-2 ${colors.border} shadow-xl transition-transform group-hover:scale-105`}
                  alt={`Preview ${idx + 1}`} 
                />
                <button 
                  onClick={() => {
                    const newImages = selectedImages.filter((_, i) => i !== idx);
                    setSelectedImages(newImages.length > 0 ? newImages : null);
                  }} 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INPUT BOX */}
        <div className={`relative flex items-end gap-2 p-2.5 rounded-[32px] border-2 ${colors.bg} ${colors.border} shadow-2xl transition-all`}>
          {/* ATTACHMENT BUTTON */}
          <div className="relative">
            <button 
              onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
              className={`p-3.5 rounded-2xl transition-all ${isAttachmentOpen ? `${colors.activeBg} ${colors.activeText}` : `${colors.hover} ${colors.text}`}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {isAttachmentOpen && (
              <div className={`absolute bottom-full left-0 mb-3 p-2 rounded-[24px] shadow-2xl border ${colors.menuBg} ${colors.menuBorder} w-48 animate-in fade-in slide-in-from-bottom-2`}>
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-all`}
                >
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`text-xs font-bold ${colors.text}`}>Camera</span>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-all`}
                >
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-xs font-bold ${colors.text}`}>Photos</span>
                </button>

                <button 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-all opacity-50 cursor-not-allowed`}
                  disabled
                >
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-xs font-bold ${colors.text}`}>Files</span>
                </button>
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />
          
          {/* TEXTAREA */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                onSend(); 
              } 
            }}
            placeholder="Ketik pesan..."
            className={`flex-1 bg-transparent py-4 px-2 focus:outline-none text-base font-medium max-h-60 min-h-[52px] overflow-y-auto no-scrollbar resize-none ${colors.text}`}
            rows={1}
          />

          {/* SEND BUTTON */}
          <button 
            onClick={onSend} 
            disabled={isLoading || (!input.trim() && (!selectedImages || selectedImages.length === 0))} 
            className={`p-4 rounded-[20px] transition-all ${(input.trim() || (selectedImages && selectedImages.length > 0)) ? `${colors.activeBg} ${colors.activeText}` : 'opacity-10'}`}
          >
            {isLoading ? (
              <div className={`w-6 h-6 border-2 border-current/30 border-t-current rounded-full animate-spin`} />
            ) : (
              <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
