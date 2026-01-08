import React, { useRef, useState, useEffect } from 'react';

type ConversationMode = 'thinking' | 'cosmic' | 'expert' | 'fast' | 'auto';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea biar makin tinggi pas ngetik (Grok style)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // Reset height
      const scHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scHeight}px`;
    }
  }, [input]);

  const modes = [
    { id: 'heavy', label: 'Heavy', desc: 'Team of experts', icon: '👥' },
    { id: 'expert', label: 'Expert', desc: 'Thinks hard', icon: '💡' },
    { id: 'fast', label: 'Fast', desc: 'Quick responses by 4.1', icon: '⚡' },
    { id: 'auto', label: 'Auto', desc: 'Chooses Fast or Expert', icon: '🚀' },
    { id: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast', icon: '🌙' },
  ];

  const currentMode = modes.find(m => m.id === activeMode) || modes[4];

  // Logic Warna Border: Garis tipis transparan sesuai mode
  const borderColor = isDark ? 'border-white/10' : 'border-black/5';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-transparent">
      {/* Container utama dengan padding bottom supaya gak ketutup keyboard di beberapa browser */}
      <div className="max-w-4xl mx-auto px-4 pb-6 md:pb-8">
        
        {/* POPUP MODE SELECTOR (Grok Style) */}
        {isModeOpen && (
          <div className="absolute bottom-[100%] mb-4 left-4 right-4 md:left-auto md:w-[320px] animate-in fade-in zoom-in-95 duration-200">
            <div className={`${isDark ? 'bg-[#161616]' : 'bg-white'} rounded-[24px] shadow-2xl border ${borderColor} overflow-hidden`}>
              {/* Header SuperRival */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚀</span>
                  <div>
                    <div className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>SuperRival</div>
                    <div className="text-[11px] text-zinc-500">Unlock advanced features</div>
                  </div>
                </div>
                <button className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold">Upgrade</button>
              </div>

              <div className="p-1.5">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeMode === m.id ? (isDark ? 'bg-zinc-800' : 'bg-zinc-100') : 'hover:bg-zinc-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.icon}</span>
                      <div className="text-left">
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{m.label}</div>
                        <div className="text-xs text-zinc-500">{m.desc}</div>
                      </div>
                    </div>
                    {activeMode === m.id && <span className="text-blue-500">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INPUT BOX UTAMA */}
        <div className={`${isDark ? 'bg-[#161616]' : 'bg-white'} rounded-[28px] border ${borderColor} shadow-2xl overflow-hidden transition-all duration-300`}>
          <div className="flex flex-col p-2">
            
            {/* Input Text Area */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja"
              className={`w-full bg-transparent px-4 py-3 focus:outline-none text-[17px] ${isDark ? 'text-white' : 'text-black'} placeholder-zinc-500 resize-none min-h-[50px] max-h-[250px]`}
              rows={1}
            />
            
            {/* Toolbar Bawah */}
            <div className="flex items-center justify-between px-2 pb-2 mt-1">
              <div className="flex items-center gap-2">
                {/* Lampiran */}
                <button onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-full ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} text-zinc-400 transition-colors`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* MODE BUTTON (Tampilan Utama: Emoji + Rival 1.0 Thinking) */}
                <button 
                  onClick={() => setIsModeOpen(!isModeOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${borderColor} ${isDark ? 'hover:bg-zinc-800 text-white' : 'hover:bg-zinc-100 text-black'} transition-all active:scale-95`}
                >
                  <span className="text-lg">{currentMode.icon}</span>
                  <span className="text-[14px] font-medium">{currentMode.label}</span>
                  <svg className={`w-4 h-4 transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Tombol Kirim & Voice */}
              <div className="flex items-center gap-2">
                <button className={`p-2.5 rounded-full ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} text-zinc-400`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
                
                <button 
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2.5 rounded-full transition-all ${input.trim() ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 opacity-40'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" />
    </div>
  );
};

