export type ConversationMode = 'thinking' | 'cosmic' | 'canvas' | 'auto';

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
}

export interface MapData {
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  uri?: string;
}

export interface EbookPage {
  title: string;
  content: string;
  visualPrompt: string;
  layout: 'split' | 'hero' | 'minimal' | 'sidebar' | 'feature' | 'gallery';
}

export interface EbookData {
  type: 'ebook' | 'playbook';
  title: string;
  author: string;
  coverImage?: string;
  pages: EbookPage[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSaved?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  codeSnippet?: string;
  sources?: WebSource[];
  mapData?: MapData;
  ebookData?: EbookData;
  documentUrl?: string;
  isOffline?: boolean;
  shouldShowArtifactCard?: boolean;
  codeIntent?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
  theme: 'white' | 'black' | 'cream' | 'slate';
  font: 'inter' | 'serif' | 'mono' | 'modern' | 'classic' | 'tech' | 'readable' | 'elegant';
  fontSize: number;
  uiScale: number;
  isSubscribed: boolean;
  isOfflineMode: boolean;
  offlineModelDownloaded: boolean;
  aiName: string;
  aiAvatar: string;
  aiPersona: string;
}
