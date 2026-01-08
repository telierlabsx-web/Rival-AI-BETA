import React, { useRef, useState, useEffect } from 'react';

type ConversationMode = 'thinking' | 'cosmic' | 'expert' | 'canvas' | 'auto';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  activeMode: ConversationMode;
  setActiveMode: (mode: ConversationMode) => void;
  isDark: boolean;
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input, setInput, isLoading, activeMode, setActiveMode, isDark, onSend
}) => {
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Icon Bulan SVG biar bukan emoji kuning
  const MoonIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const modes = [
    { id: 'auto', label: 'Auto', desc: 'Chooses Fast or Expert', icon: '🚀' },
    { id: 'cosmic', label: 'Cosmic', desc: 'Pencarian realtime atau chat lebih dalam', icon: '🌐' },
    { id: 'canvas', label: 'Canvas', desc: 'Code & review', icon: '⚡' },
    { id: 'expert', label: 'Expert', desc: 'Thinks hard', icon: '💡' },
    { id: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast', icon: <MoonIcon /> },
  ];

  const currentMode = modes.find(m => m.id === activeMode) || modes[4];

  return (
    // Memastikan input tidak tertutup keyboard dengan pb-[env(safe-area-inset-bottom)]
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-transparent pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto px-4 pb-4">
        
        {/* POPUP ATTACHMENT (Foto 4 style) */}
        {isAttachOpen && (
          <div className="absolute bottom-[80px] left-6 w-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={`${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} rounded-2xl border shadow-2xl p-2`}>
              {['Camera', 'Photos', 'Files'].map((item) => (
                <button key={item} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                  <span className="opacity-60">{item === 'Camera' ? '📷' : item === 'Photos' ? '🖼️' : '📄'}</span>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* POPUP MODE - Posisi di kiri sejajar pill */}
        {isModeOpen && (
          <div className="absolute bottom-[80px] left-6 w-[300px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={`${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} rounded-[24px] border shadow-2xl overflow-hidden`}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>SuperRival</span>
                  <span className="text-[11px] text-zinc-500">Unlock advanced features</span>
                </div>
                <button className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold">Upgrade</button>
              </div>
              <div className="p-1.5">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id as ConversationMode); setIsModeOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${activeMode === m.id ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-80">{m.icon}</span>
                      <div className="text-left">
                        <div className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{m.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-tight">{m.desc}</div>
                      </div>
                    </div>
                    {activeMode === m.id && <div className="w-5 h-5 flex items-center justify-center bg-blue-500 rounded-full text-[10px] text-white">✓</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INPUT BAR UTAMA - Clean Grok Style */}
        <div className={`${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-black/5'} rounded-[32px] border shadow-2xl transition-all`}>
          <div className="flex flex-col p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja"
              className={`w-full bg-transparent px-4 py-3 focus:outline-none text-[17px] ${isDark ? 'text-white' : 'text-black'} placeholder-zinc-500 resize-none min-h-[44px]`}
              rows={1}
            />
            
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1.5">
                {/* Attachment Button */}
                <button onClick={() => setIsAttachOpen(!isAttachOpen)} className="p-2.5 text-zinc-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Pill Mode Rival 1.0 Thinking */}
                <button 
                  onClick={() => { setIsModeOpen(!isModeOpen); setIsAttachOpen(false); }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5'} transition-all`}
                >
                  <span className="text-zinc-400"><MoonIcon /></span>
                  <span className={`text-[13px] font-bold ${isDark ? 'text-zinc-200' : 'text-black'}`}>{currentMode.label}</span>
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 text-zinc-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
                
                {/* Tombol Kirim Monokrom Bulat */}
                <button 
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${input.trim() ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'bg-zinc-800 text-zinc-600'}`}
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
    </div>
  );
};

