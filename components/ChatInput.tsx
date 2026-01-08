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
  const [isModeOpen, setIsModeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize yang bener-bener smooth
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scHeight, 200)}px`;
    }
  }, [input]);

  // Data Mode dengan Icon Monokrom (Grok Style) - Referensi Foto 3
  const modes = [
    { id: 'heavy', label: 'Heavy', desc: 'Team of experts', icon: '󱚧' },
    { id: 'expert', label: 'Expert', desc: 'Thinks hard', icon: '󰛨' },
    { id: 'fast', label: 'Fast', desc: 'Quick responses by 4.1', icon: '󱐋' },
    { id: 'auto', label: 'Auto', desc: 'Chooses Fast or Expert', icon: '󰈸' },
    { id: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast', icon: '󰽢' },
  ];

  const currentMode = modes.find(m => m.id === activeMode) || modes[4];

  return (
    // Pake sticky supaya dia makan space dan gak nutupin riwayat chat secara absolut
    <div className="sticky bottom-0 w-full z-[100] bg-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto px-2 pb-4 pointer-events-auto">
        
        {/* POPUP MODE - Dibuat lebih kecil & monokrom sesuai Foto 3 */}
        {isModeOpen && (
          <div className="absolute bottom-full mb-2 left-2 right-2 md:left-auto md:w-[280px] animate-in fade-in slide-in-from-bottom-2">
            <div className={`${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-black/5'} rounded-[20px] shadow-xl border overflow-hidden`}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>SuperRival</span>
                <button className="text-[11px] font-bold uppercase tracking-wider opacity-60">Upgrade</button>
              </div>
              <div className="p-1">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeMode === m.id ? (isDark ? 'bg-zinc-800' : 'bg-zinc-100') : 'hover:opacity-70'}`}
                  >
                    <span className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>{m.id === 'thinking' ? '🌙' : '•'}</span>
                    <div className="text-left">
                      <div className={`text-[13px] font-medium ${isDark ? 'text-white' : 'text-black'}`}>{m.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INPUT BAR - Border tipis & Layout Foto 4 */}
        <div className={`${isDark ? 'bg-[#121212]' : 'bg-white'} rounded-[24px] border ${isDark ? 'border-white/10' : 'border-black/10'} shadow-lg`}>
          <div className="flex flex-col">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja"
              className={`w-full bg-transparent px-4 py-3 focus:outline-none text-[16px] ${isDark ? 'text-white' : 'text-black'} placeholder-zinc-500 resize-none`}
              rows={1}
            />
            
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-1">
                {/* Icon Attachment Monokrom */}
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Pill Mode Monokrom - Rival 1.0 Thinking */}
                <button 
                  onClick={() => setIsModeOpen(!isModeOpen)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'} active:scale-95 transition-all`}
                >
                  <span className="text-sm">🌙</span>
                  <span className={`text-[12px] font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{currentMode.label}</span>
                  <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Icon */}
                <button className="p-2 text-zinc-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
                
                {/* Send Button Monokrom Bulat */}
                <button 
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full transition-all ${input.trim() ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'bg-zinc-800/50 text-zinc-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

