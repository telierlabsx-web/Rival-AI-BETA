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

const ChatInput: React.FC<ChatInputProps> = ({
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

  const getThemeColors = () => {
    switch(theme) {
      case 'black':
        return {
          bg: 'bg-[#1c1c1c]',
          border: 'border-zinc-700/30',
          text: 'text-white',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-800/50',
          activeBg: 'bg-black',
          activeText: 'text-white',
          menuBg: 'bg-[#2a2a2a]',
          menuBorder: 'border-zinc-700'
        };
      case 'slate':
        return {
          bg: 'bg-zinc-800',
          border: 'border-zinc-600/30',
          text: 'text-white',
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-zinc-700/50',
          activeBg: 'bg-zinc-900',
          activeText: 'text-white',
          menuBg: 'bg-zinc-700',
          menuBorder: 'border-zinc-600'
        };
      case 'blue':
        return {
          bg: 'bg-white',
          border: 'border-blue-200/40',
          text: 'text-blue-950',
          textMuted: 'text-blue-600',
          hover: 'hover:bg-blue-50/50',
          activeBg: 'bg-blue-600',
          activeText: 'text-white',
          menuBg: 'bg-white',
          menuBorder: 'border-blue-200'
        };
      case 'cream':
        return {
          bg: 'bg-[#faf8f4]',
          border: 'border-[#e8e3d8]/40',
          text: 'text-[#2a2520]',
          textMuted: 'text-[#6b5d52]',
          hover: 'hover:bg-[#f0ebe0]/50',
          activeBg: 'bg-[#2a2520]',
          activeText: 'text-[#faf8f4]',
          menuBg: 'bg-white',
          menuBorder: 'border-[#e8e3d8]'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-zinc-200/40',
          text: 'text-black',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-50/50',
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 pointer-events-none">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto space-y-3">
        
        {/* SELECTED IMAGES PREVIEW */}
        {selectedImages && selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl border ${colors.border} shadow-lg`}
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

        {/* MAIN INPUT BOX - KOTAK PERSEGI KAYAK GROK */}
        <div className={`relative ${colors.bg} rounded-3xl border ${colors.border} shadow-xl overflow-visible`}>
          
          {/* MODE DROPDOWN */}
          {isModeOpen && (
            <div className={`absolute bottom-full left-0 right-0 mb-2 p-2.5 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder}`}>
              {/* SUPER RIVAL UPGRADE */}
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl ${colors.hover} mb-1.5`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🌙</span>
                  <div>
                    <div className={`text-xs font-black uppercase ${colors.text}`}>SuperRival</div>
                    <div className={`text-[9px] ${colors.textMuted}`}>Unlock advanced features</div>
                  </div>
                </div>
                <button className={`px-2.5 py-1 rounded-full ${colors.activeBg} ${colors.activeText} text-[9px] font-black uppercase`}>
                  Upgrade
                </button>
              </div>

              {/* MODE OPTIONS */}
              <div className="space-y-0.5">
                {['thinking', 'cosmic', 'canvas'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setActiveMode(mode as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${activeMode === mode ? `${colors.activeBg} ${colors.activeText}` : colors.hover} transition-all`}
                  >
                    {getModeIcon(mode as ConversationMode)}
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold">{getModeLabel(mode as ConversationMode)}</div>
                      <div className={`text-[9px] ${activeMode === mode ? 'opacity-60' : colors.textMuted}`}>
                        {mode === 'thinking' ? 'Thinks fast' : mode === 'cosmic' ? 'Deep conversations' : 'Coding & review'}
                      </div>
                    </div>
                    {activeMode === mode && (
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
            <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder} w-40`}>
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl ${colors.hover} transition-all text-left`}
              >
                <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Camera</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl ${colors.hover} transition-all text-left`}
              >
                <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Photos</span>
              </button>

              <button 
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl ${colors.hover} transition-all opacity-40 cursor-not-allowed text-left`}
                disabled
              >
                <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Files</span>
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />

          {/* CONTENT - SEMUA FLAT DALAM 1 ROW */}
          <div className="px-4 py-3.5">
            {/* INPUT ROW */}
            <div className="flex items-center gap-3 mb-3">
              <input
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    onSend(); 
                  } 
                }}
                placeholder="Tanya apa saja"
                className={`flex-1 bg-transparent focus:outline-none text-base font-normal ${colors.text} placeholder:${colors.textMuted}`}
              />
            </div>

            {/* BOTTOM ROW */}
            <div className="flex items-center gap-2">
              {/* ATTACHMENT BUTTON */}
              <button 
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                className={`p-2 rounded-full transition-all ${isAttachmentOpen ? `${colors.activeBg} ${colors.activeText}` : `${colors.hover} ${colors.text}`}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* MODE SELECTOR */}
              <button
                onClick={() => setIsModeOpen(!isModeOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${colors.hover} transition-all`}
              >
                {getModeIcon(activeMode)}
                <span className={`text-sm font-bold ${colors.text}`}>{getModeLabel(activeMode)}</span>
                <svg className={`w-3.5 h-3.5 ${colors.text} transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* SPACER */}
              <div className="flex-1" />

              {/* SEND/VOICE BUTTON */}
              <button 
                onClick={onSend} 
                disabled={isLoading} 
                className={`p-2.5 rounded-full ${colors.activeBg} ${colors.activeText} shadow-md transition-all ${!input.trim() && !selectedImages ? 'opacity-40' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : input.trim() || selectedImages ? (
                  <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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

// Demo component
export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [activeMode, setActiveMode] = useState<ConversationMode>('thinking');
  const [theme, setTheme] = useState('white');

  const handleSend = () => {
    if (!input.trim() && !selectedImages) return;
    setIsLoading(true);
    setTimeout(() => {
      setInput('');
      setSelectedImages(null);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className={`min-h-screen relative ${theme === 'black' ? 'bg-black' : theme === 'slate' ? 'bg-zinc-900' : theme === 'blue' ? 'bg-blue-50' : theme === 'cream' ? 'bg-[#faf8f4]' : 'bg-white'}`}>
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <button onClick={() => setTheme('white')} className="w-8 h-8 rounded-full bg-white border-2 border-zinc-300" />
        <button onClick={() => setTheme('black')} className="w-8 h-8 rounded-full bg-black border-2 border-zinc-700" />
        <button onClick={() => setTheme('slate')} className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-700" />
        <button onClick={() => setTheme('blue')} className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-300" />
        <button onClick={() => setTheme('cream')} className="w-8 h-8 rounded-full bg-[#faf8f4] border-2 border-[#e8e3d8]" />
      </div>

      <div className={`flex items-center justify-center min-h-screen p-8 ${theme === 'black' || theme === 'slate' ? 'text-white' : 'text-black'}`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Grok-Style Input</h1>
          <p className={`${theme === 'black' || theme === 'slate' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Kotak persegi rounded-3xl! 📦
          </p>
        </div>
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isDark={theme === 'black' || theme === 'slate'}
        theme={theme}
        onSend={handleSend}
        autoFocus
      />
    </div>
  );
                            }
