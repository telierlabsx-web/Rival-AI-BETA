
import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types';

export const useSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('rival_sessions');
    if (!saved) return [];
    try {
      return JSON.parse(saved).map((s: any) => ({
        ...s,
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
    } catch (e) {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    if (sessions.length > 0) return sessions[0].id;
    return null;
  });

  // Auto-create first session if none exist to skip initialization screens
  useEffect(() => {
    if (sessions.length === 0) {
      const newId = Date.now().toString();
      const firstSession: ChatSession = {
        id: newId,
        title: "Chat Baru",
        messages: [],
        updatedAt: new Date()
      };
      setSessions([firstSession]);
      setCurrentSessionId(newId);
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('rival_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "Pesan Baru",
      messages: [],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const updateSessionMessages = (id: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        // Use first message as title or fallback to existing
        const firstUserMsg = messages.find(m => m.role === 'user');
        const newTitle = firstUserMsg ? firstUserMsg.content.slice(0, 30) : s.title;
        return { ...s, messages, updatedAt: new Date(), title: newTitle };
      }
      return s;
    }));
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const clearAllData = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.clear();
    window.location.reload();
  };

  return {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    createNewChat,
    updateSessionMessages,
    deleteSession,
    clearAllData
  };
};
