import React, { useRef, useState, useEffect } from 'react';

type ConversationMode = 'thinking' | 'cosmic' | 'expert' | 'canvas' | 'auto';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  activeMode: ConversationMode;
  setActiveMode: (mode: ConversationMode) => void;
  isAutoMode: boolean;
  setIsAutoMode: (value: boolean) => void;
  isDark: boolean;
  onSend: () => void;
  selectedImages?: string[] | null;
  setSelectedImages?: (images: string[] | null) => void;
  theme?: string;
  autoFocus?: boolean;
  isSidebarOpen?: boolean;
}

const Icons = {
  Moon: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Cosmic: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Canvas: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Auto: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Camera: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Photos: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Files: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
};

export const ChatInput: React.FC<ChatInputProps> = ({
  input, 
  setInput, 
  isLoading, 
  activeMode, 
  setActiveMode, 
  isAutoMode,
  setIsAutoMode,
  isDark, 
  onSend
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

  const modes = [
    { id: 'thinking', label: 'Rival 1.0 Thinking', desc: 'Thinks fast', icon: <Icons.Moon /> },
    { id: 'auto', label: 'Auto', desc: 'Chooses Fast or Expert automatically', icon: <Icons.Auto /> },
    { id: 'cosmic', label: 'Cosmic', desc: 'Pencarian realtime atau chat lebih dalam', icon: <Icons.Cosmic /> },
    { id: 'canvas', label: 'Canvas', desc: 'Code & review', icon: <Icons.Canvas /> },
  ];

  const currentMode = modes.find(m => m.id === activeMode) || modes[0];
  const isAutoActive = activeMode === 'auto';

  return (
    // 🔥 FIX: pointer-events-none pada container, pointer-events-auto pada content
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="max-w-3xl mx-auto px-4 pb-6 pt-4 pointer-events-auto">
        
        {/* Attachment Menu */}
        {isAttachOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150 z-[110]">
            <div className={`${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} rounded-2xl border shadow-2xl p-1.5`}>
              {[{ name: 'Camera', icon: <Icons.Camera /> }, { name: 'Photos', icon: <Icons.Photos /> }, { name: 'Files', icon: <Icons.Files /> }].map((item) => (
                <button 
                  key={item.name} 
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDark ? 'text-white hover:bg-zinc-800/50' : 'text-black hover:bg-zinc-100'} text-[14px]`}
                >
                  <span className="opacity-70">{item.icon}</span> {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Selector Menu */}
        {isModeOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-[310px] animate-in fade-in slide-in-from-bottom-2 duration-150 z-[110]">
            <div className={`${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} rounded-[24px] border shadow-2xl overflow-hidden`}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={isDark ? 'text-white' : 'text-black'}><Icons.Auto /></span>
                    <span className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>SuperRival</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Unlock advanced features</span>
                </div>
                <button className="px-4 py-1.5 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-tight">Upgrade</button>
              </div>
              <div className="p-1.5">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { 
                      setActiveMode(m.id as ConversationMode);
                      setIsAutoMode(m.id === 'auto');
                      setIsModeOpen(false); 
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all ${activeMode === m.id ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="opacity-70">{m.icon}</span>
                      <div className="text-left leading-tight">
                        <div className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>{m.label}</div>
                        <div className="text-[10px] text-zinc-500">{m.desc}</div>
                      </div>
                    </div>
                    {activeMode === m.id && <div className="w-4 h-4 flex items-center justify-center bg-white rounded-full text-[10px] text-black">✓</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className={`${isDark ? 'bg-[#121212] border-white/10' : 'bg-zinc-100 border-black/5'} rounded-[28px] border shadow-sm transition-all`}>
          <div className="flex flex-col p-2">
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
              placeholder="Tanya apa saja"
              className="w-full bg-transparent px-4 py-2 focus:outline-none text-[16px] text-inherit placeholder-zinc-500 resize-none overflow-y-auto"
              rows={1}
            />
            
            <div className="flex items-center justify-between px-2 pb-1 mt-1">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {setIsAttachOpen(!isAttachOpen); setIsModeOpen(false);}} 
                  className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg className="w-6 h-6 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Mode Selector Button */}
                <button 
                  onClick={() => { setIsModeOpen(!isModeOpen); setIsAttachOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isAutoActive
                      ? (isDark ? 'border-white/20 bg-white/10' : 'border-black/20 bg-black/10') 
                      : (isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5')
                  }`}
                >
                  <span className={isAutoActive ? 'text-white' : 'text-zinc-400'}>{currentMode.icon}</span>
                  <span className={`text-[12px] font-bold ${isAutoActive ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-200' : 'text-black')}`}>
                    {currentMode.label}
                  </span>
                  {isAutoActive && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                  <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isModeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
                
                <button 
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                    input.trim() && !isLoading
                      ? (isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-800') 
                      : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                  }`}
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
