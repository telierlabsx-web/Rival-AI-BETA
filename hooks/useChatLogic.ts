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
  const [activeMode, setActiveMode] = useState<ConversationMode>('thinking');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const cleanTextFromCode = (text: string) => {
    return text.replace(/```(?:html|javascript|css|typescript|xml)?\n[\s\S]*?```/g, '').trim();
  };

  // 🔥 STREAMING ANIMATION FUNCTION
  const streamText = async (
    fullText: string,
    messageId: string,
    userMessage: Message,
    baseMessage: Omit<Message, 'content'>
  ) => {
    const words = fullText.split(' ');
    let currentText = '';
    
    setStreamingMessageId(messageId);

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      const streamingMessage: Message = {
        ...baseMessage,
        id: messageId,
        content: currentText,
        timestamp: new Date()
      };

      onUpdateMessages([...session!.messages, userMessage, streamingMessage]);
      
      // Delay antara kata (makin cepat makin smooth, tapi jangan terlalu cepat)
      await new Promise(resolve => setTimeout(resolve, 30)); // 30ms per kata
    }

    setStreamingMessageId(null);
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
        result = { 
          text: responseText, 
          imageUrl: "", 
          codeSnippet: "", 
          sources: [],
          shouldShowArtifactCard: false,
          codeIntent: undefined
        };
      } else {
        const useAuto = activeMode === 'auto';
        result = await geminiService.chat(
          [...session.messages, userMessage],
          profile.aiPersona,
          activeMode,
          selectedImages || undefined,
          undefined,
          useAuto
        );
      }

      setIsLoading(false);

      const messageId = (Date.now() + 1).toString();
      const baseMessage = {
        role: 'assistant' as const,
        imageUrl: result.imageUrl || undefined,
        codeSnippet: result.codeSnippet || undefined,
        sources: result.sources || undefined,
        ebookData: result.ebookData || undefined,
        mapData: result.mapData || undefined,
        isOffline: profile.isOfflineMode,
        shouldShowArtifactCard: result.shouldShowArtifactCard || false,
        codeIntent: result.codeIntent || undefined
      };

      // 🔥 START STREAMING ANIMATION
      await streamText(result.text, messageId, userMessage, baseMessage);

    } catch (error: any) {
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || "Maaf, Rival sedang mengalami gangguan teknis. Coba lagi dalam beberapa saat.",
        timestamp: new Date(),
        isOffline: profile.isOfflineMode
      };
      onUpdateMessages([...session.messages, userMessage, errorMessage]);
    }
  };

  return {
    isLoading,
    activeMode,
    setActiveMode,
    isAutoMode,
    setIsAutoMode,
    cleanTextFromCode,
    handleSend,
    streamingMessageId
  };
};
