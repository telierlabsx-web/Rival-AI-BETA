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
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-zinc-800/80',
          activeBg: 'bg-zinc-800',
          menuBg: 'bg-[#2a2a2a]',
          menuBorder: 'border-zinc-800',
          sendBg: 'bg-white',
          sendText: 'text-black',
          bubbleBg: 'bg-zinc-800/60'
        };
      case 'slate':
        return {
          bg: 'bg-zinc-900',
          border: 'border-zinc-800',
          text: 'text-white',
          textMuted: 'text-zinc-400',
          hover: 'hover:bg-zinc-800/80',
          activeBg: 'bg-zinc-700',
          menuBg: 'bg-zinc-800',
          menuBorder: 'border-zinc-700',
          sendBg: 'bg-white',
          sendText: 'text-black',
          bubbleBg: 'bg-zinc-800/60'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-zinc-200',
          text: 'text-black',
          textMuted: 'text-zinc-500',
          hover: 'hover:bg-zinc-50',
          activeBg: 'bg-zinc-100',
          menuBg: 'bg-white',
          menuBorder: 'border-zinc-200',
          sendBg: 'bg-black',
          sendText: 'text-white',
          bubbleBg: 'bg-zinc-100/80'
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
      className={`fixed bottom-0 right-0 left-0 p-4 pointer-events-none z-10 ${
        isSidebarOpen ? 'md:left-[380px]' : ''
      }`}
    >
      <div className="max-w-3xl mx-auto w-full pointer-events-auto">
        
        {/* Image Preview */}
        {selectedImages && selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img 
                  src={img} 
                  className="w-16 h-16 object-cover rounded-xl border border-zinc-700 shadow-lg"
                  alt={`Preview ${idx + 1}`} 
                />
                <button 
                  onClick={() => {
                    const newImages = selectedImages.filter((_, i) => i !== idx);
                    setSelectedImages(newImages.length > 0 ? newImages : null);
                  }} 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container */}
        <div className={`relative ${colors.bg} rounded-3xl border ${colors.border} shadow-2xl backdrop-blur-xl`}>
          
          {/* Mode Selection Modal - Grok Style */}
          {isModeOpen && (
            <div className={`absolute bottom-full left-0 right-0 mb-3 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder} backdrop-blur-xl overflow-hidden`}>
              {/* SuperRival Banner */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${colors.text}`}>SuperRival</div>
                      <div className="text-xs text-zinc-400">Unlock advanced features</div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-100 transition-colors shadow-md">
                    Upgrade
                  </button>
                </div>
              </div>

              {/* Mode Options */}
              <div className="p-2">
                {[
                  { mode: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast' },
                  { mode: 'cosmic', label: 'Expert', desc: 'Thinks hard' },
                  { mode: 'canvas', label: 'Canvas', desc: 'Code & review' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => { 
                      setActiveMode(item.mode as ConversationMode); 
                      setIsModeOpen(false); 
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      activeMode === item.mode 
                        ? `${colors.activeBg}` 
                        : colors.hover
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {activeMode === item.mode ? getModeIcon() : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold ${colors.text}`}>{item.label}</div>
                      <div className="text-xs text-zinc-400">{item.desc}</div>
                    </div>
                    {activeMode === item.mode && (
                      <svg className="w-5 h-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
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
            <div className={`absolute bottom-full left-0 mb-3 rounded-3xl shadow-2xl border ${colors.menuBg} ${colors.menuBorder} p-2 w-52 backdrop-blur-xl`}>
              <button 
                onClick={() => cameraInputRef.current?.click()} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-all`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Camera</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${colors.hover} transition-all`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Photos</span>
              </button>

              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl opacity-40 cursor-not-allowed`} 
                disabled
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${colors.text}`}>Files</span>
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraCapture} />

          {/* Input Area */}
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja"
              rows={isExpanded ? 4 : 1}
              className={`w-full bg-transparent focus:outline-none text-base ${colors.text} placeholder-zinc-500 resize-none leading-6 mb-3`}
            />

            {/* Bottom Bar */}
            <div className="flex items-center gap-2">
              {/* Attachment Button */}
              <button 
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                className={`p-2 rounded-full ${colors.bubbleBg} ${colors.hover} transition-all`}
                title="Attach files"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Mode Selector with Bubble Background */}
              <button 
                onClick={() => setIsModeOpen(!isModeOpen)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-full ${colors.bubbleBg} ${colors.hover} transition-all`}
              >
                {getModeIcon()}
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

              {/* Expand Button */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-full ${isExpanded ? colors.activeBg : colors.bubbleBg} ${colors.hover} transition-all`}
                title="Expand textarea"
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

              {/* Send Button */}
              <button 
                onClick={onSend} 
                disabled={isLoading || !input.trim()} 
                className={`p-3 rounded-full ${colors.sendBg} ${colors.sendText} shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
              >
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

