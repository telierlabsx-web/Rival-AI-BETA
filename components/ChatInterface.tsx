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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    activeMode,
    setActiveMode,
    isAutoMode,
    setIsAutoMode,
    cleanTextFromCode,
    handleSend: handleSendLogic,
    streamingMessageId
  } = useChatLogic(session, profile, onUpdateMessages, checkImageLimit, incrementImageUsage);

  useEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      return () => clearTimeout(timer);
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
    <div className="flex-1 flex flex-col h-screen md:h-[100dvh] relative overflow-hidden">
      <ChatHeader 
        sessionTitle={session.title}
        isDark={isDark}
        isOfflineMode={profile.isOfflineMode}
        onToggleSidebar={() => {
          setIsSidebarOpen(!isSidebarOpen);
          onToggleSidebar();
        }}
        onNewChat={onNewChat}
        onToggleOffline={() => onUpdateProfile({ ...profile, isOfflineMode: !profile.isOfflineMode })}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-56">
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
                isStreaming={msg.id === streamingMessageId}
              />
            ))}
            
            {isLoading && (
              <div className={`w-full flex justify-center py-8 md:py-12 ${assistantRowBg}`}>
                <div className="w-full max-w-4xl flex gap-4 md:gap-6 px-4 md:px-6">
                  <div className="flex-shrink-0">
                    <img src={profile.aiAvatar} className={`w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover shadow-sm ${borderColor} border`} alt="Rival" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-7 h-7 flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full border-[3px] border-transparent ${
                        profile.isOfflineMode 
                          ? 'border-t-amber-500 border-r-amber-500' 
                          : isDark 
                            ? 'border-t-white border-r-white' 
                            : 'border-t-black border-r-black'
                      } opacity-20 animate-spin`} style={{ animationDuration: '1.2s' }} />
                      
                      <div className={`absolute inset-[5px] rounded-full border-[3px] border-transparent ${
                        profile.isOfflineMode 
                          ? 'border-b-amber-500 border-l-amber-500' 
                          : isDark 
                            ? 'border-b-white border-l-white' 
                            : 'border-b-black border-l-black'
                      } opacity-40 animate-spin`} style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
                    </div>
                    
                    <p className={`text-xs md:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} font-medium`}>
                      Sedang berpikir...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="h-80 w-full flex-shrink-0" aria-hidden="true" />
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
        isAutoMode={isAutoMode}
        setIsAutoMode={setIsAutoMode}
        isDark={isDark}
        theme={profile.theme}
        onSend={handleSend}
        autoFocus={true}
        isSidebarOpen={isSidebarOpen}
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
