import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, UserProfile, Message } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageRow } from './MessageRow';
import { ChatInput } from './ChatInput';
import { ArtifactModal } from './ArtifactModal';
import { ImageViewerModal } from './ImageViewerModal';
import { LimitErrorModal } from './LimitErrorModal';
import { EmptyState } from './EmptyState';
import { useChatLogic } from '../hooks/useChatLogic';

interface ChatInterfaceProps {
  session: ChatSession | null;
  profile: UserProfile;
  onUpdateMessages: (messages: Message[]) => void;
  onUpdateProfile: (p: UserProfile) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  checkImageLimit: () => boolean;
  incrementImageUsage: () => void;
}

// ✅ HELPER: Get dynamic loading message based on user request
const getLoadingMessage = (lastMessage: string): string => {
  const text = lastMessage.toLowerCase();
  
  if (
    text.includes('gambar') || 
    text.includes('lukis') || 
    text.includes('draw') || 
    text.includes('generate image') ||
    text.includes('buatkan visual') ||
    text.includes('bikin foto') ||
    text.includes('buat gambar')
  ) {
    return 'Sedang membuat visual...';
  }
  
  if (
    text.includes('buatkan aplikasi') ||
    text.includes('bikin aplikasi') ||
    text.includes('buat aplikasi') ||
    text.includes('buatkan web') ||
    text.includes('bikin web') ||
    text.includes('buat web') ||
    text.includes('kalkulator') ||
    text.includes('dashboard') ||
    text.includes('landing page') ||
    text.includes('todo') ||
    text.includes('timer') ||
    text.includes('game') ||
    text.includes('website') ||
    text.includes('aplikasi') ||
    text.includes('code') ||
    text.includes('coding')
  ) {
    return 'Tunggu, kode sedang dibuat...';
  }
  
  if (
    text.includes('youtube') ||
    text.includes('video') ||
    text.includes('ringkas') ||
    text.includes('summarize') ||
    text.includes('youtu.be')
  ) {
    return 'Sedang merangkum video...';
  }
  
  if (
    text.includes('dimana') ||
    text.includes('tempat') ||
    text.includes('restoran') ||
    text.includes('resto') ||
    text.includes('kafe') ||
    text.includes('cafe') ||
    text.includes('hotel') ||
    text.includes('wisata') ||
    text.includes('lokasi') ||
    text.includes('maps') ||
    text.includes('cari tempat') ||
    text.includes('dekat sini') ||
    text.includes('sekitar')
  ) {
    return 'Sedang mencari lokasi...';
  }
  
  return 'Sedang berpikir...';
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  profile,
  onUpdateMessages,
  onUpdateProfile,
  onToggleSidebar,
  onNewChat,
  checkImageLimit,
  incrementImageUsage
}) => {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [limitError, setLimitError] = useState(false);
  const [artifactCode, setArtifactCode] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Sedang berpikir...');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    activeMode,
    setActiveMode,
    cleanTextFromCode,
    handleSend: handleSendLogic
  } = useChatLogic(session, profile, onUpdateMessages, checkImageLimit, incrementImageUsage);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [session?.messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleToggleSave = (id: string) => {
    if (!session) return;
    const newMessages = session.messages.map(m => 
      m.id === id ? { ...m, isSaved: !m.isSaved } : m
    );
    onUpdateMessages(newMessages);
  };

  const handleDownloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `rival-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = () => {
    // ✅ Set dynamic loading message based on user input
    const dynamicMessage = getLoadingMessage(input);
    setLoadingMessage(dynamicMessage);
    
    handleSendLogic(input, selectedImages, setInput, setSelectedImages, setLimitError);
  };

  const isDark = profile.theme === 'black' || profile.theme === 'slate';
  const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const assistantRowBg = profile.isOfflineMode ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50') : 
                        (profile.theme === 'black' ? 'bg-zinc-900/40' : 
                        profile.theme === 'slate' ? 'bg-zinc-800/40' : 
                        profile.theme === 'cream' ? 'bg-[#f5f1e8]' : 'bg-gray-50');

  if (!session) return null;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatHeader 
        sessionTitle={session.title}
        isDark={isDark}
        isOfflineMode={profile.isOfflineMode}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        onToggleOffline={() => onUpdateProfile({ ...profile, isOfflineMode: !profile.isOfflineMode })}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-60">
        {session.messages.length === 0 ? (
          <EmptyState 
            aiAvatar={profile.aiAvatar}
            activeMode={activeMode}
            isDark={isDark}
            borderColor={borderColor}
          />
        ) : (
          <div className="flex flex-col">
            {session.messages.map((msg) => (
              <MessageRow 
                key={msg.id}
                message={msg}
                profile={profile}
                isDark={isDark}
                borderColor={borderColor}
                assistantRowBg={assistantRowBg}
                cleanTextFromCode={cleanTextFromCode}
                onCopy={handleCopy}
                onToggleSave={handleToggleSave}
                onDownloadImage={handleDownloadImage}
                onViewImage={setViewingImage}
                onOpenArtifact={setArtifactCode}
                copyFeedback={copyFeedback}
              />
            ))}
            {isLoading && (
              <div className={`w-full flex justify-center py-10 md:py-16 ${assistantRowBg}`}>
                <div className="w-full max-w-4xl flex gap-6 md:gap-10 px-6">
                  <div className="flex-shrink-0">
                    <img src={profile.aiAvatar} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm ${borderColor} border`} alt="Rival" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${profile.isOfflineMode ? 'bg-amber-500' : 'bg-current'} opacity-20 animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full ${profile.isOfflineMode ? 'bg-amber-500' : 'bg-current'} opacity-20 animate-bounce`} style={{ animationDelay: '200ms' }} />
                      <div className={`w-2 h-2 rounded-full ${profile.isOfflineMode ? 'bg-amber-500' : 'bg-current'} opacity-20 animate-bounce`} style={{ animationDelay: '400ms' }} />
                    </div>
                    {/* ✅ DYNAMIC LOADING MESSAGE */}
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} font-medium`}>
                      {loadingMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isDark={isDark}
        theme={profile.theme}
        onSend={handleSend}
        autoFocus={true}
      />

      {limitError && (
        <LimitErrorModal isDark={isDark} borderColor={borderColor} onClose={() => setLimitError(false)} />
      )}

      {artifactCode && (
        <ArtifactModal code={artifactCode} onClose={() => setArtifactCode(null)} />
      )}

      {viewingImage && (
        <ImageViewerModal 
          imageUrl={viewingImage} 
          onClose={() => setViewingImage(null)} 
          onDownload={() => handleDownloadImage(viewingImage)} 
        />
      )}
    </div>
  );
};
