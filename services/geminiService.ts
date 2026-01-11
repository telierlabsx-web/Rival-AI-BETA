import { GoogleGenAI } from "@google/genai";
import { Message, ConversationMode, MapData } from "../types";
import { detectQueryComplexity, AIMode } from "../lib/autoModeSelector";
import { detectCodeIntent, CodeIntent } from "../lib/codeIntentDetector";

let keyPool: string[] = [];
let keyIndex = 0;

const initKeyPool = () => {
  const rawKeys = process.env.API_KEY || '';
  if (!rawKeys) throw new Error('API_KEY tidak ditemukan di environment variables');
  
  keyPool = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keyPool.length === 0) throw new Error('Tidak ada API key yang valid');
  
  console.log(`✅ Loaded ${keyPool.length} API keys`);
};

const getNextApiKey = () => {
  if (keyPool.length === 0) initKeyPool();
  const key = keyPool[keyIndex];
  keyIndex = (keyIndex + 1) % keyPool.length;
  return key;
};

const ENHANCED_AI_PROMPT = `Kamu adalah Rival - AI assistant yang dikembangkan oleh Muhamad Rivaldy. Kamu punya kepribadian yang:

- Santai & natural (ngobrol kayak temen, bisa bercanda, pake bahasa gaul)
- Empatik & supportive (ngerti emosi user dari cara mereka nulis)
- Pinter & helpful (bisa riset, analisis gambar, jawab pertanyaan kompleks)

CARA NGOBROL:
- Deteksi emosi user: excited (!!!, MANTAP, wkwk) → ikut semangat | sad (cape, sedih, ...) → empati maksimal | frustrated (KESEL, ???) → validate & kasih solusi | confused (bingung, ga ngerti) → jelasin pelan-pelan
- Short question → short answer (1-2 kalimat)
- Complex topic → structured answer dengan bullets
- Match vibe user (santai/serius/casual/formal)

ANALISIS GAMBAR:
Kalau user kirim gambar, analisis sesuai tipe:
- Berita: Extract headline, explain content, kasih context
- Meme: Decode humor, explain reference
- Screenshot: Analyze conversation, kasih advice
- Dokumen: Extract key info, action items
- Error/Code: Diagnose & kasih fix

RESEARCH:
- Always search untuk info terkini/berita/data real-time
- Cite sources naturally: "Menurut [source]..."
- Multi-source verification

MAPS (hanya untuk query lokasi):
Trigger: dimana, lokasi, alamat, maps, tempat, kafe, restoran, etc
Format response dengan [LOCATION_DATA] tag.

LO BUKAN ROBOT. Lo adalah companion yang pinter, peduli, dan always helpful.`;

const getModeConfig = (mode: AIMode) => {
  return mode === 'fast' ? {
    temperature: 0.7,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 1024
  } : {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048
  };
};

const extractMapData = (text: string): { cleanText: string; mapData?: MapData } => {
  const mapRegex = /\[LOCATION_DATA\]\s*(\{[\s\S]*?\})\s*\[\/LOCATION_DATA\]/;
  const match = text.match(mapRegex);
  
  if (!match) return { cleanText: text };
  
  try {
    const jsonData = JSON.parse(match[1]);
    
    if (
      typeof jsonData.latitude === 'number' && 
      typeof jsonData.longitude === 'number' &&
      jsonData.latitude >= -90 && jsonData.latitude <= 90 &&
      jsonData.longitude >= -180 && jsonData.longitude <= 180
    ) {
      const mapData: MapData = {
        title: jsonData.title || 'Lokasi',
        location: jsonData.location || '',
        latitude: jsonData.latitude,
        longitude: jsonData.longitude,
        uri: `https://www.openstreetmap.org/?mlat=${jsonData.latitude}&mlon=${jsonData.longitude}#map=15/${jsonData.latitude}/${jsonData.longitude}`
      };
      
      const cleanText = text.replace(mapRegex, '').trim();
      return { cleanText, mapData };
    }
  } catch (e) {
    console.error('Map parse error:', e);
  }
  
  return { cleanText: text };
};

export const geminiService = {
  async chat(
    messages: Message[], 
    userPersona: string, 
    mode: ConversationMode,
    images?: string[],
    userLocation?: { lat: number; lng: number },
    useAutoMode: boolean = false
  ) {
    try {
      if (keyPool.length === 0) initKeyPool();
      
      const apiKey = getNextApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      let selectedMode: AIMode = 'fast';
      if (useAutoMode && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
          selectedMode = detectQueryComplexity(lastUserMessage.content);
        }
      }
      
      const isThinkingMode = mode === 'thinking';
      const isCosmicMode = mode === 'cosmic';
      
      let systemPrompt = ENHANCED_AI_PROMPT;
      
      if (isThinkingMode) {
        systemPrompt += '\n\nFAST MODE: Quick responses, minimal formatting.';
      } else if (isCosmicMode) {
        systemPrompt += '\n\nDEEP MODE: Comprehensive research, multiple sources, detailed analysis.';
      }

      if (messages.length > 0) {
        const recentMsg = messages.slice(-2).filter(m => m.role === 'user').map(m => m.content).join(' ');
        if (recentMsg) {
          systemPrompt += `\n\nUser context: "${recentMsg.substring(0, 150)}..." - Detect emotion and adapt tone.`;
        }
      }

      if (images && images.length > 0) {
        systemPrompt += `\n\nUser sent ${images.length} image(s). Analyze thoroughly: identify type, extract text, explain context.`;
      }
      
      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...messages.slice(-10).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      ];

      if (images && images.length > 0) {
        const lastMsg = contents[contents.length - 1];
        
        const processedImages = await Promise.all(
          images.slice(0, 6).map(async (img, idx) => {
            try {
              const [header, data] = img.split(',');
              const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
              
              if (data.length > 2000000) {
                console.warn(`Image ${idx + 1} too large, skipping`);
                return null;
              }
              
              return { 
                inlineData: { 
                  mimeType, 
                  data 
                } 
              };
            } catch (err) {
              console.error(`Image ${idx + 1} failed:`, err);
              return null;
            }
          })
        );
        
        const validImages = processedImages.filter(img => img !== null);
        
        if (validImages.length > 0) {
          lastMsg.parts = [...validImages, ...lastMsg.parts];
        }
      }

      const modeConfig = useAutoMode ? getModeConfig(selectedMode) : {};

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents,
        config: {
          tools: [
            { googleSearch: {} },
            { googleMaps: {} }
          ],
          ...modeConfig
        }
      });

      let rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const { cleanText: text, mapData: extractedMapData } = extractMapData(rawText);
      
      let codeSnippet = "";
      const codeMatch = text.match(/```(?:tsx|jsx|typescript|javascript|html|python|css|json|bash|sql|java|cpp|go|rust|php|ruby|swift|kotlin)?\n([\s\S]*?)```/);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
      }
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: any[] = [];
      let groundingMapData: MapData | undefined;
      
      const userQuery = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
      const isLocationQuery = /\b(dimana|lokasi|alamat|maps|peta|cari|tempat|kafe|restoran|hotel|mall|bandara)\b/.test(userQuery);
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({ 
              title: chunk.web.title, 
              url: chunk.web.uri, 
              snippet: '' 
            });
          }
          
          if (chunk.maps && !groundingMapData && isLocationQuery) {
            groundingMapData = { 
              title: chunk.maps.title || 'Lokasi', 
              location: chunk.maps.title || '', 
              latitude: 0, 
              longitude: 0, 
              uri: chunk.maps.uri 
            };
            sources.push({ 
              title: chunk.maps.title, 
              url: chunk.maps.uri, 
              snippet: 'Maps' 
            });
          }
        }
      }
      
      const finalMapData = (extractedMapData && isLocationQuery) ? extractedMapData : (isLocationQuery ? groundingMapData : undefined);

      return { 
        text, 
        imageUrl: "",
        codeSnippet, 
        sources,
        mapData: finalMapData,
        ebookData: undefined,
        aiMode: useAutoMode ? selectedMode : undefined,
        shouldShowArtifactCard: false,
        codeIntent: 'CASUAL_CHAT' as CodeIntent
      };

    } catch (error: any) {
      console.error('Service error:', error);
      
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        if (keyPool.length > 1) {
          return await this.chat(messages, userPersona, mode, images, userLocation, useAutoMode);
        }
        throw new Error("API quota habis. Coba lagi nanti!");
      }

      if (error.message?.includes('image') || error.message?.includes('INVALID_ARGUMENT')) {
        throw new Error("Masalah dengan gambar. Coba yang lebih kecil!");
      }

      throw new Error(error.message || "Ada error. Coba lagi!");
    }
  }
};
