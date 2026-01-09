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
  const [activeMode, setActiveMode] = useState<ConversationMode>('chat');
  const [isAutoMode, setIsAutoMode] = useState(true); // 🔥 AUTO MODE ACTIVE BY DEFAULT

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
        // 🔥 PASS AUTO MODE FLAG KE GEMINI SERVICE
        result = await geminiService.chat(
          [...session.messages, userMessage],
          profile.aiPersona,
          activeMode,
          selectedImages || undefined,
          undefined,
          isAutoMode // Pass auto mode flag
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
        isOffline: profile.isOfflineMode
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
    isAutoMode, // 🔥 EXPORT AUTO MODE STATE
    setIsAutoMode, // 🔥 EXPORT AUTO MODE SETTER
    cleanTextFromCode,
    handleSend
  };
};
