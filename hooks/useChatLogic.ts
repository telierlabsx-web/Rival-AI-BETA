import { useState } from 'react';
import { ChatSession, UserProfile, Message, ConversationMode } from '../types';
import { geminiService } from '../services/geminiService';
import { offlineService } from '../services/offlineService';

export const useChatLogic = (
  session: ChatSession | null,
  profile: UserProfile,
  onUpdateMessages: (messages: Message[]) => void,
  checkImageLimit: () => boolean,
  incrementImageUsage: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<ConversationMode>('thinking'); // 🔥 DEFAULT: THINKING
  const [isAutoMode, setIsAutoMode] = useState(false); // 🔥 DEFAULT: OFF

  const cleanTextFromCode = (text: string) => {
    return text.replace(/```(?:html|javascript|css|typescript|xml)?\n[\s\S]*?```/g, '').trim();
  };

  const handleSend = async (
    input: string,
    selectedImages: string[] | null,
    setInput: (v: string) => void,
    setSelectedImages: (v: string[] | null) => void,
    setLimitError: (v: boolean) => void
  ) => {
    if (!input.trim() || !session) return;

    if (selectedImages && selectedImages.length > 0) {
      const canProceed = checkImageLimit();
      if (!canProceed) {
        setLimitError(true);
        return;
      }
      incrementImageUsage();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      imageUrls: selectedImages || undefined
    };

    onUpdateMessages([...session.messages, userMessage]);
    setInput('');
    setSelectedImages(null);
    setIsLoading(true);

    try {
      let result;
      if (profile.isOfflineMode) {
        const responseText = await offlineService.chat(input, session.messages);
        result = { text: responseText, imageUrl: "", codeSnippet: "", sources: [] };
      } else {
        // 🔥 Cek activeMode, bukan isAutoMode
        const useAuto = activeMode === 'auto';
        result = await geminiService.chat(
          [...session.messages, userMessage],
          profile.aiPersona,
          activeMode,
          selectedImages || undefined,
          undefined,
          useAuto // Pass true hanya kalau activeMode === 'auto'
        );
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        imageUrl: result.imageUrl || undefined,
        codeSnippet: result.codeSnippet || undefined,
        sources: result.sources || undefined,
        ebookData: result.ebookData || undefined,
        mapData: result.mapData || undefined,
        isOffline: profile.isOfflineMode,
        // 🔥 NEW: Pass Canvas metadata
        shouldShowArtifactCard: result.shouldShowArtifactCard || false,
        codeIntent: result.codeIntent || undefined
      };

      onUpdateMessages([...session.messages, userMessage, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || "Maaf, Rival sedang mengalami gangguan teknis. Coba lagi dalam beberapa saat.",
        timestamp: new Date(),
        isOffline: profile.isOfflineMode
      };
      onUpdateMessages([...session.messages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    activeMode,
    setActiveMode,
    isAutoMode,
    setIsAutoMode,
    cleanTextFromCode,
    handleSend
  };
};
