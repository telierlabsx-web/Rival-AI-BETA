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
  const [rows, setRows] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (input && isAttachmentOpen) {
      setIsAttachmentOpen(false);
    }
  }, [input]);

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

  const toggleExpand = () => {
    setRows(rows === 1 ? 4 : 1);
  };

  // PROPER THEME DETECTION
  const getColors = () => {
    const isReallyDark = isDark || theme === 'black' || theme === 'slate';
    
    if (isReallyDark) {
      return {
        bg: 'bg-zinc-800',
        border: 'border-zinc-700',
        text: 'text-white',
        textMuted: 'text-zinc-400',
        hover: 'hover:bg-zinc-700',
        activeBg: 'bg-zinc-700',
        menuBg: 'bg-zinc-900',
        menuBorder: 'border-zinc-800',
        sendBg: 'bg-white',
        sendText: 'text-black',
        modalBg: 'bg-zinc-900/95'
      };
    }
    
    return {
      bg: 'bg-[#f5f5f5]',
      border: 'border-zinc-300',
      text: 'text-black',
      textMuted: 'text-zinc-500',
      hover: 'hover:bg-zinc-200',
      activeBg: 'bg-zinc-200',
      menuBg: 'bg-white',
      menuBorder: 'border-zinc-200',
      sendBg: 'bg-black',
      sendText: 'text-white',
      modalBg: 'bg-white/95'
    };
  };

  const colors = getColors();

  const getModeLabel = () => {
    switch(activeMode) {
      case 'thinking': return 'Rival 1.0 Thinking';
      case 'cosmic': return 'Expert';
      case 'canvas': return 'Canvas';
    }
  };

  const getModeIcon = (mode: string) => {
    const iconColor = colors.text === 'text-white' ? 'text-white' : 'text-black';
    
    switch(mode) {
      case 'thinking':
        return (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'cosmic':
        return (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'canvas':
        return (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-10 ${isSidebarOpen ? 'md:left-[380px]' : ''}`}>
      <div className="max-w-3xl mx-auto px-4 pb-4">
        
        {selectedImages && selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img 
                  src={img} 
                  className={`w-16 h-16 object-cover rounded-xl border ${colors.border} shadow`}
                  alt={`Preview ${idx + 1}`} 
                />
                <button 
                  onClick={() => {
                    const newImages = selectedImages.filter((_, i) => i !== idx);
                    setSelectedImages(newImages.length > 0 ? newImages : null);
                  }} 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          
          {/* Mode Modal */}
          {isModeOpen && (
            <div 
              className="fixed inset-0 z-50"
              onClick={() => setIsModeOpen(false)}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div 
                className="absolute left-4 right-4 bottom-24 max-w-3xl mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`${colors.modalBg} backdrop-blur-xl rounded-3xl shadow-2xl border ${colors.menuBorder} overflow-hidden`}>
                  <div className={`px-5 py-4 border-b ${colors.menuBorder} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${colors.text}`}>SuperRival</div>
                        <div className={`text-xs ${colors.textMuted}`}>Unlock advanced features</div>
                      </div>
                    </div>
                    <button className={`px-4 py-1.5 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} text-xs font-bold hover:opacity-80 transition-opacity`}>
                      Upgrade
                    </button>
                  </div>

                  <div className="p-3">
                    {[
                      { mode: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast' },
                      { mode: 'cosmic', label: 'Expert', desc: 'Thinks hard' },
                      { mode: 'canvas', label: 'Canvas', desc: 'Code & review' }
                    ].map((item, idx) => (
                      <button
                        key={item.mode}
                        onClick={() => { 
                          setActiveMode(item.mode as ConversationMode); 
                          setIsModeOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-colors ${
                          idx !== 2 ? 'mb-1' : ''
                        } ${
                          activeMode === item.mode 
                            ? colors.activeBg
                            : colors.hover
                        }`}
                      >
                        <div className="w-5 h-5 flex-shrink-0">
                          {getModeIcon(item.mode)}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className={`text-[15px] font-semibold ${colors.text} leading-tight`}>{item.label}</div>
                          <div className={`text-[13px] ${colors.textMuted} leading-tight mt-0.5`}>{item.desc}</div>
                        </div>
                        
                        {activeMode === item.mode && (
                          <svg className={`w-5 h-5 flex-shrink-0 ${colors.text}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachment Modal */}
          {isAttachmentOpen && (
            <div 
              className="fixed inset-0 z-50"
              onClick={() => setIsAttachmentOpen(false)}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div 
                className="absolute left-4 bottom-24 w-60"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`${colors.modalBg} backdrop-blur-xl rounded-3xl shadow-2xl border ${colors.menuBorder} p-2`}>
                  <button 
                    onClick={() => { cameraInputRef.current?.click(); setIsAttachmentOpen(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-colors`}
                  >
                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={`text-sm font-medium ${colors.text}`}>Camera</span>
                  </button>
                  
                  <button 
                    onClick={() => { fileInputRef.current?.click(); setIsAttachmentOpen(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-colors`}
                  >
                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm font-medium ${colors.text}`}>Photos</span>
                  </button>

                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl opacity-40 cursor-not-allowed`}>
                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm font-medium ${colors.text}`}>Files</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />

          {/* Input Box */}
          <div className={`${colors.bg} rounded-3xl border ${colors.border} shadow-lg`}>
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya apa saja"
                rows={rows}
                className={`w-full bg-transparent focus:outline-none text-base ${colors.text} ${colors.textMuted.replace('text-', 'placeholder-')} resize-none leading-6 mb-3`}
              />

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                  className={`p-2 rounded-full ${colors.hover} transition-colors`}
                >
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <button 
                  onClick={() => setIsModeOpen(!isModeOpen)} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-full ${colors.hover} transition-colors`}
                >
                  {getModeIcon(activeMode)}
                  <span className={`text-sm font-medium ${colors.text}`}>{getModeLabel()}</span>
                  <svg 
                    className={`w-4 h-4 ${colors.text} transition-transform ${isModeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="flex-1" />

                <button 
                  onClick={toggleExpand}
                  className={`p-2 rounded-full transition-colors ${
                    rows === 4 ? colors.activeBg : colors.hover
                  }`}
                  title={rows === 4 ? "Collapse" : "Expand to 4 lines"}
                >
                  <svg 
                    className={`w-5 h-5 ${colors.text} transition-transform ${rows === 4 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <button 
                  onClick={onSend} 
                  disabled={isLoading || !input.trim()} 
                  className={`p-3 rounded-full ${colors.sendBg} ${colors.sendText} shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
                >
                  {isLoading ? (
                    <div className={`w-5 h-5 border-2 ${colors.sendText === 'text-white' ? 'border-white/30 border-t-white' : 'border-black/30 border-t-black'} rounded-full animate-spin`} />
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
    </div>
  );
};

