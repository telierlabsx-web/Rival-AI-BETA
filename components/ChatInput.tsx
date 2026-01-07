import React, { useRef, useState, useEffect } from 'react';

type ConversationMode = 'thinking' | 'cosmic' | 'canvas';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  selectedImages: string[] | null;
  setSelectedImages: (value: string[] | null) => void;
  activeMode: ConversationMode;
  setActiveMode: (mode: ConversationMode) => void;
  isDark: boolean;
  theme: string;
  onSend: () => void;
  autoFocus?: boolean;
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
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

  const getThemeColors = () => {
    switch(theme) {
      case 'black':
        return {
          bg: 'bg-[#1e1e1e]',
          border: 'border-zinc-800/50',
          text: 'text-white',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-800',
          activeBg: 'bg-zinc-700',
          menuBg: 'bg-[#2a2a2a]',
          menuBorder: 'border-zinc-700',
          sendBg: 'bg-white',
          sendText: 'text-black'
        };
      case 'slate':
        return {
          bg: 'bg-zinc-800',
          border: 'border-zinc-700/50',
          text: 'text-white',
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-zinc-700',
          activeBg: 'bg-zinc-600',
          menuBg: 'bg-zinc-700',
          menuBorder: 'border-zinc-600',
          sendBg: 'bg-white',
          sendText: 'text-black'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-zinc-200',
          text: 'text-black',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-100',
          activeBg: 'bg-zinc-200',
          menuBg: 'bg-white',
          menuBorder: 'border-zinc-200',
          sendBg: 'bg-black',
          sendText: 'text-white'
        };
    }
  };

  const colors = getThemeColors();

  const getModeIcon = () => {
    return (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 4v2M12 18v2M6 12H4M20 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41"/>
      </svg>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 pointer-events-none z-50">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto space-y-2">
        
        {/* SELECTED IMAGES */}
        {selectedImages && selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img 
                  src={img} 
                  className={`w-14 h-14 object-cover rounded-2xl border ${colors.border} shadow-lg`}
                  alt={`Preview ${idx + 1}`} 
                />
                <button 
                  onClick={() => {
                    const newImages = selectedImages.filter((_, i) => i !== idx);
                    setSelectedImages(newImages.length > 0 ? newImages : null);
                  }} 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INPUT BOX - LAYOUT GROK */}
        <div className={`relative ${colors.bg} rounded-[30px] border ${colors.border} shadow-xl`}>
          
          {/* MODE DROPDOWN */}
          {isModeOpen && (
            <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-[26px] shadow-2xl border ${colors.menuBg} ${colors.menuBorder} p-2.5 backdrop-blur-2xl`}>
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-[20px] ${colors.hover} mb-1.5`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className={`text-[13px] font-bold ${colors.text}`}>SuperRival</div>
                    <div className={`text-[11px] ${colors.textMuted}`}>Unlock advanced features</div>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-black text-white text-[11px] font-bold">Upgrade</button>
              </div>

              <div className="space-y-0.5">
                {[
                  { mode: 'thinking', icon: '🌙', label: 'Grok 4.1 Thinking', desc: 'Thinks fast' },
                  { mode: 'cosmic', icon: '💡', label: 'Expert', desc: 'Thinks hard' },
                  { mode: 'canvas', icon: '⚡', label: 'Fast', desc: 'Quick responses by 4.1' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => { setActiveMode(item.mode as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[20px] ${activeMode === item.mode ? `${colors.activeBg} ${colors.text}` : colors.hover} transition-all`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-[13px] font-semibold">{item.label}</div>
                      <div className={`text-[11px] ${activeMode === item.mode ? 'opacity-70' : colors.textMuted}`}>{item.desc}</div>
                    </div>
                    {activeMode === item.mode && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ATTACHMENT DROPDOWN */}
          {isAttachmentOpen && (
            <div className={`absolute bottom-full left-0 mb-2 rounded-[24px] shadow-2xl border ${colors.menuBg} ${colors.menuBorder} p-2 w-40 backdrop-blur-2xl`}>
              <button onClick={() => cameraInputRef.current?.click()} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[18px] ${colors.hover} transition-all text-left`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[13px] font-medium">Camera</span>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[18px] ${colors.hover} transition-all text-left`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[13px] font-medium">Photos</span>
              </button>

              <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[18px] ${colors.hover} transition-all opacity-40 cursor-not-allowed text-left`} disabled>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-[13px] font-medium">Files</span>
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />

          {/* CONTENT - INPUT ATAS, TOOLS BAWAH */}
          <div className="p-3">
            {/* INPUT DI ATAS */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
              placeholder="Tanya apa saja"
              className={`w-full bg-transparent focus:outline-none text-[15px] mb-3 ${colors.text} placeholder:${colors.textMuted}`}
            />

            {/* TOOLS DI BAWAH */}
            <div className="flex items-center gap-2">
              {/* ATTACHMENT BUTTON KIRI */}
              <button onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} className={`p-2 rounded-full ${isAttachmentOpen ? colors.activeBg : colors.hover} transition-all flex-shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* MODE SELECTOR TENGAH */}
              <button onClick={() => setIsModeOpen(!isModeOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${colors.hover} transition-all flex-shrink-0`}>
                {getModeIcon()}
                <span className={`text-[13px] font-medium ${colors.text}`}>Grok 4.1 Thinking</span>
                <svg className={`w-3.5 h-3.5 ${colors.text} transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* SPACER */}
              <div className="flex-1" />

              {/* SEND BUTTON KANAN */}
              <button onClick={onSend} disabled={isLoading} className={`p-3 rounded-full ${colors.sendBg} ${colors.sendText} shadow-lg transition-all disabled:opacity-40 flex-shrink-0`}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
