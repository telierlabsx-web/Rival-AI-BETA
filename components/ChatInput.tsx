import React, { useRef, useState, useEffect } from 'react';

type ConversationMode = 'thinking' | 'cosmic' | 'expert' | 'canvas';

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
  input, setInput, isLoading, selectedImages, setSelectedImages,
  activeMode, setActiveMode, isDark, theme, onSend, autoFocus = true
}) => {
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea biar mulus pas ngetik banyak
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // LOGIC VOICE RECOGNITION (SPEECH TO TEXT)
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser tidak mendukung voice");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const colors = {
    inputBg: isDark ? 'bg-[#1e1e1e]' : 'bg-white',
    border: isDark ? 'border-zinc-800' : 'border-zinc-200',
    text: isDark ? 'text-white' : 'text-black',
    textMuted: isDark ? 'text-zinc-500' : 'text-zinc-400',
    menuBg: isDark ? 'bg-[#1e1e1e]/95' : 'bg-white/95',
    hover: isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100',
    active: isDark ? 'bg-zinc-800' : 'bg-zinc-100',
  };

  // Urutan Mode sesuai request lo (Grok Style)
  const modes = [
    { id: 'cosmic', label: 'Cosmic', desc: 'Pencarian real-time', icon: '🌐' },
    { id: 'expert', label: 'Expert', desc: 'Thinks hard', icon: '💡' },
    { id: 'canvas', label: 'Canvas', desc: 'Code & review', icon: '⚡' },
    { id: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast', icon: '🌙' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-3xl mx-auto px-3 pb-3">
        
        {/* POPUP MODE SELECTOR */}
        {isModeOpen && (
          <div className="absolute bottom-[85px] left-3 right-3 md:left-auto md:w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={`${colors.menuBg} backdrop-blur-xl rounded-[28px] shadow-2xl border ${colors.border} overflow-hidden`}>
              {/* Banner SuperRival */}
              <div className={`px-5 py-4 border-b ${colors.border} flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-transparent`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <div>
                    <div className={`text-[15px] font-bold ${colors.text}`}>SuperRival</div>
                    <div className={`text-[11px] ${colors.textMuted}`}>Upgrade untuk fitur pro</div>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold transition-transform active:scale-95">
                  Upgrade
                </button>
              </div>

              <div className="p-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeMode === m.id ? colors.active : colors.hover}`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <div className="text-left flex-1">
                      <div className={`text-[14px] font-semibold ${colors.text}`}>{m.label}</div>
                      <div className={`text-[12px] ${colors.textMuted}`}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POPUP ATTACHMENT */}
        {isAttachmentOpen && (
          <div className="absolute bottom-[85px] left-3 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={`${colors.menuBg} backdrop-blur-xl rounded-[24px] shadow-2xl border ${colors.border} p-1.5`}>
              <button onClick={() => cameraInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${colors.hover} transition-colors`}>
                <span>📷</span> <span className={`text-sm font-medium ${colors.text}`}>Camera</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${colors.hover} transition-colors`}>
                <span>🖼️</span> <span className={`text-sm font-medium ${colors.text}`}>Photos</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${colors.hover} transition-colors`}>
                <span>📄</span> <span className={`text-sm font-medium ${colors.text}`}>Files</span>
              </button>
            </div>
          </div>
        )}

        {/* INPUT BAR UTAMA */}
        <div className={`${colors.inputBg} rounded-[32px] border ${colors.border} shadow-lg transition-all focus-within:ring-1 focus-within:ring-zinc-400`}>
          <div className="px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Mendengarkan..." : "Tanya apa saja"}
              className={`w-full bg-transparent focus:outline-none text-[16px] ${colors.text} placeholder-zinc-500 resize-none min-h-[44px] max-h-[200px]`}
              rows={1}
            />
            
            <div className="flex items-center justify-between mt-1 pt-1">
              <div className="flex items-center gap-1">
                <button onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} className={`p-2 rounded-full ${colors.hover} text-zinc-500 transition-colors`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <button 
                  onClick={() => setIsModeOpen(!isModeOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.border} ${colors.hover} transition-all active:scale-95`}
                >
                  <span>{modes.find(m => m.id === activeMode)?.icon}</span>
                  <span className={`text-[13px] font-bold ${colors.text}`}>{modes.find(m => m.id === activeMode)?.label}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* TOMBOL MIC */}
                <button 
                  onClick={startVoice}
                  className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : `${colors.hover} text-zinc-500`}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* TOMBOL KIRIM */}
                <button 
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full transition-all ${input.trim() ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 opacity-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" />
        <input type="file" ref={cameraInputRef} className="hidden" capture="environment" />
      </div>
    </div>
  );
};

