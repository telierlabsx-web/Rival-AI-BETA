
import { useState, useCallback } from 'react';
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

  const cleanTextFromCode = (text: string) => {
    // Keep the markdown logic but allow the UI to decide whether to hide it
    // For Artifacts, we often want to hide the block in the chat text but show the card
    return text
      .replace(/```(?:html|javascript|css|typescript|xml|json)?\n[\s\S]*?```/g, '')
      .replace(/\*/g, '')
      .trim();
  };

  const getUserLocation = (): Promise<{lat: number, lng: number} | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(undefined);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });
  };

  const handleSend = useCallback(async (
    input: string, 
    images: string[] | null, 
    setInput: (v: string) => void, 
    setImages: (v: string[] | null) => void,
    setLimitError: (v: boolean) => void
  ) => {
    if (!session || (!input.trim() && (!images || images.length === 0))) return;

    // Visual mode logic
    if (activeMode === 'visual' && !checkImageLimit()) {
      setLimitError(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      imageUrls: images || undefined
    };

    const currentMessages = [...session.messages, userMsg];
    onUpdateMessages(currentMessages);
    setInput('');
    setImages(null);
    setIsLoading(true);

    try {
      let assistantMsg: Message;

      if (profile.isOfflineMode) {
        if (!offlineService.isReady()) {
          await offlineService.init();
        }
        
        const offlineResponse = await offlineService.chat(input, currentMessages);
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: offlineResponse,
          timestamp: new Date(),
          isOffline: true
        };
      } else {
        let userLocation;
        if (input.toLowerCase().match(/(dekat|sini|sekitar|lokasi|maps|dimana)/i)) {
          userLocation = await getUserLocation();
        }

        const response = await geminiService.chat(
          currentMessages,
          profile.aiPersona,
          activeMode,
          images || undefined,
          userLocation
        );

        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
          imageUrl: response.imageUrl || undefined,
          codeSnippet: response.codeSnippet || undefined,
          sources: response.sources || [],
          ebookData: response.ebookData,
          mapData: response.mapData
        };
      }

      onUpdateMessages([...currentMessages, assistantMsg]);
      if (assistantMsg.imageUrl) incrementImageUsage();
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "Maaf, Rival sedang mengalami gangguan teknis. Coba lagi dalam beberapa saat.",
        timestamp: new Date()
      };
      onUpdateMessages([...currentMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [session, profile, activeMode, onUpdateMessages, checkImageLimit, incrementImageUsage]);

  return {
    isLoading,
    activeMode,
    setActiveMode,
    cleanTextFromCode,
    handleSend
  };
};
