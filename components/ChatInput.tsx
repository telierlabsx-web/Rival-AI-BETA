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
  isSidebarOpen?: boolean;
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
  autoFocus = false,
  isSidebarOpen = false
}) => {
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
          bg: 'bg-[#1e1e1e]',
          border: 'border-zinc-800/50',
          text: 'text-white',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-800',
          activeBg: 'bg-zinc-700',
          menuBg: 'bg-[#2a2a2a]',
          menuBorder: 'border-zinc-700',
          sendBg: 'bg-white',
          sendText: 'text-black',
          bubbleBg: 'bg-zinc-800/90'
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
          sendText: 'text-black',
          bubbleBg: 'bg-zinc-700/90'
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
          sendText: 'text-white',
          bubbleBg: 'bg-white/90'
        };
    }
  };

  const colors = getThemeColors();

  const getModeLabel = () => {
    switch(activeMode) {
      case 'thinking': return 'Rival 1.0 Thinking';
      case 'cosmic': return 'Expert';
      case 'canvas': return 'Canvas';
      default: return 'Rival 1.0 Thinking';
    }
  };

  const getModeIcon = () => {
    switch(activeMode) {
      case 'thinking':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'cosmic':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'canvas':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`fixed bottom-0 right-0 p-4 md:p-6 pointer-events-none z-10 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'left-[380px]' : 'left-0'
      }`}
    >
      <div className="max-w-3xl mx-auto w-full pointer-events-auto space-y-3">
        
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

        <div className={`relative ${colors.bg} rounded-[30px] border ${colors.border} shadow-xl`}>
          
          {/* Mode Selection Modal - Grok Style */}
          {isModeOpen && (
            <div className={`absolute bottom-full left-0 mb-2 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder} backdrop-blur-xl overflow-hidden w-full max-w-md`}>
              {/* SuperRival Upgrade Banner */}
              <div className={`flex items-center justify-between px-4 py-3 ${colors.hover}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${colors.text}`}>SuperRival</div>
                    <div className={`text-xs ${colors.textMuted}`}>Unlock advanced features</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors">
                  Upgrade
                </button>
              </div>

              {/* Mode Options */}
              <div className="p-2">
                {[
                  { mode: 'thinking', icon: getModeIcon(), label: 'Rival 1.0 Thinking', desc: 'Thinks fast', available: true },
                  { mode: 'cosmic', icon: getModeIcon(), label: 'Expert', desc: 'Thinks hard', available: true },
                  { mode: 'canvas', icon: getModeIcon(), label: 'Canvas', desc: 'Code & review', available: true }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => { setActiveMode(item.mode as ConversationMode); setIsModeOpen(false); }}
                    disabled={!item.available}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      activeMode === item.mode 
                        ? `${colors.activeBg} ${colors.text}` 
                        : item.available 
                          ? colors.hover 
                          : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold ${colors.text}`}>{item.label}</div>
                      <div className={`text-xs ${colors.textMuted}`}>{item.desc}</div>
                    </div>
                    {activeMode === item.mode && (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attachment Modal */}
          {isAttachmentOpen && (
            <div className={`absolute bottom-full left-0 mb-2 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder} p-2 w-48 backdrop-blur-xl`}>
              <button onClick={() => cameraInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl ${colors.hover} transition-all text-left`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Camera</span>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl ${colors.hover} transition-all text-left`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Photos</span>
              </button>

              <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl ${colors.hover} transition-all opacity-40 cursor-not-allowed text-left`} disabled>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Files</span>
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />

          <div className="p-4 md:p-5">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja"
              rows={isExpanded ? 4 : 1}
              className={`w-full bg-transparent focus:outline-none text-base mb-3 ${colors.text} placeholder:${colors.textMuted} resize-none overflow-y-auto leading-6`}
            />

            {/* Bottom Controls */}
            <div className="flex items-center gap-2">
              {/* Attachment Button */}
              <button 
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                className={`p-2 rounded-full ${isAttachmentOpen ? colors.activeBg : colors.hover} transition-all`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Mode Selector Button */}
              <button 
                onClick={() => setIsModeOpen(!isModeOpen)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.hover} transition-all`}
              >
                {getModeIcon()}
                <span className={`text-sm font-medium ${colors.text} hidden sm:inline`}>{getModeLabel()}</span>
                <svg className={`w-4 h-4 ${colors.text} transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="flex-1" />

              {/* Expand Button (Left Arrow on keyboard) */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-full ${isExpanded ? colors.activeBg : colors.hover} transition-all`}
                title="Expand input"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* Send Button (Up Arrow) */}
              <button 
                onClick={onSend} 
                disabled={isLoading || !input.trim()} 
                className={`p-2.5 rounded-full ${colors.sendBg} ${colors.sendText} shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
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

