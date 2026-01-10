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
  
  console.log(`✅ Loaded ${keyPool.length} API keys untuk rotation`);
};

const getNextApiKey = () => {
  if (keyPool.length === 0) initKeyPool();
  
  const key = keyPool[keyIndex];
  keyIndex = (keyIndex + 1) % keyPool.length;
  return key;
};

// 🔥 CONCISE BUT POWERFUL EMOTIONAL AI PROMPT
const ENHANCED_AI_PROMPT = `You are Rival - an AI assistant developed by Muhamad Rivaldy (17 years old) from vCrop startup, launched as Rival AI Beta 2025-2026.

CORE IDENTITY:
- Smart research assistant powered by Google Gemini
- Emotionally intelligent and adaptive companion
- Natural conversational style (mix Indonesian-English)
- Expert in image analysis (news, memes, screenshots, documents, etc)

EMOTIONAL PATTERN DETECTION:
Analyze user text for emotions and adapt your tone:

EXCITED (!!!, MANTAP, KEREN, wkwk, 🔥💯): Match energy, be enthusiastic
SAD (cape, nyerah, sedih, ..., 😢😭): Ultra empathetic, supportive, NO toxic positivity
FRUSTRATED (CAPSLOCK, KESEL, ???, 😤😡): Validate feelings, calm approach, solution-focused
CONFUSED (bingung, ga ngerti, 🤔): Patient, clear, step-by-step explanations
GRATEFUL (thanks, makasih, 🙏): Humble, warm, encouraging
NEUTRAL: Friendly, efficient, helpful

RESPONSE STYLE:
- Short queries (1-5 words): Keep it brief (1-2 sentences)
- Standard questions: Medium length (2-4 sentences)
- Complex topics: Structured and detailed with bullets/numbers
- Match user's language style (formal vs casual)
- Use slang naturally: wkwk, anjir, mantap, sip

IMAGE ANALYSIS FRAMEWORK:
When user sends images, identify type and analyze thoroughly:
- NEWS/ARTICLES: Extract headlines, analyze content, provide context, critical thinking
- MEMES: Decode humor, cultural context, relate to current events
- SCREENSHOTS (chat/social): Analyze conversation, give objective advice
- DOCUMENTS: Extract key info, identify action items
- PRODUCTS: Evaluate, pros/cons, recommendations
- ERRORS/CODE: Diagnose issue, provide step-by-step fix
- INFOGRAPHICS: Break down data, explain significance

RESEARCH & GROUNDING:
- Always search for current events, recent data, real-time info
- Verify from multiple sources (3+ minimum)
- Natural citations: "Menurut [source], [info]..."
- Fact-check and cross-reference

LOCATION/MAPS (only for location queries):
Keywords: dimana, lokasi, alamat, maps, tempat, kafe, restoran, hotel, etc
Format: Explain place thoroughly FIRST, then add:
[LOCATION_DATA]
{"title": "Place Name", "location": "Address", "latitude": -6.1754, "longitude": 106.8272}
[/LOCATION_DATA]

CORE PRINCIPLES:
1. Empathy always - understand user emotions from text patterns
2. Adaptive intelligence - adjust tone to match user mood
3. No judgment - safe space for all questions
4. Solution-oriented - actually solve problems
5. Natural & human - not robotic, friendly companion

Be the AI companion that truly understands and helps. Analyze emotional cues, provide thoughtful responses, and make every interaction valuable.`;

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
      
      console.log('🗺️ [MAP] Extracted location:', mapData.title);
      return { cleanText, mapData };
    }
  } catch (e) {
    console.error('❌ [MAP] Failed to parse location data:', e);
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
          console.log(`🤖 [AUTO MODE] Selected: ${selectedMode.toUpperCase()}`);
        }
      }
      
      const isThinkingMode = mode === 'thinking';
      const isCosmicMode = mode === 'cosmic';
      
      console.log(`💬 [CHAT] Mode: ${mode.toUpperCase()}, Auto: ${useAutoMode ? selectedMode.toUpperCase() : 'OFF'}, Images: ${images?.length || 0}`);
      
      let systemPrompt = ENHANCED_AI_PROMPT;
      
      if (isThinkingMode) {
        systemPrompt += '\n\nFAST MODE: Quick, concise responses with minimal formatting.';
      } else if (isCosmicMode) {
        systemPrompt += '\n\nDEEP MODE: Comprehensive research with multiple sources, detailed analysis, and citations.';
      }

      // Emotional context from recent messages
      if (messages.length > 0) {
        const recentMessages = messages.slice(-3).filter(m => m.role === 'user').map(m => m.content).join(' ');
        systemPrompt += `\n\nUSER CONTEXT: "${recentMessages.substring(0, 200)}..." - Detect emotion (excited/sad/frustrated/confused/grateful/neutral) and adapt your tone accordingly.`;
      }

      // Image analysis context
      if (images && images.length > 0) {
        systemPrompt += `\n\nIMAGE ANALYSIS: User sent ${images.length} image(s). Identify type (news/meme/document/screenshot/product/error) and provide thorough analysis. Extract text, explain context, give insights.`;
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

      // Process and validate images
      if (images && images.length > 0) {
        const lastMsg = contents[contents.length - 1];
        
        const processedImages = await Promise.all(
          images.slice(0, 6).map(async (img, idx) => {
            try {
              const [header, data] = img.split(',');
              const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
              
              const sizeMB = (data.length * 0.75) / (1024 * 1024);
              
              if (data.length > 2000000) {
                console.warn(`⚠️ [IMAGE ${idx + 1}] Too large (${sizeMB.toFixed(2)}MB), skipping`);
                return null;
              }
              
              console.log(`✅ [IMAGE ${idx + 1}] Valid - ${(sizeMB * 1024).toFixed(0)}KB`);
              
              return { 
                inlineData: { 
                  mimeType, 
                  data 
                } 
              };
            } catch (err) {
              console.error(`❌ [IMAGE ${idx + 1}] Failed:`, err);
              return null;
            }
          })
        );
        
        const validImages = processedImages.filter(img => img !== null);
        
        if (validImages.length > 0) {
          console.log(`📸 [IMAGES] Sending ${validImages.length}/${images.length} valid images`);
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
              location: chunk.maps.title || 'Ditemukan', 
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

      // Detect emotion
      const emotionalIndicators = {
        excited: /(!{2,}|MANTAP|KEREN|AMAZING|wkwk|haha)/i.test(userQuery),
        sad: /(sedih|cape|nyerah|susah|\.{3,}|😢|😭)/i.test(userQuery),
        frustrated: /(KESEL|RIBET|ANNOYING|\?{3,}|😤|😡)/i.test(userQuery),
        confused: /(bingung|ga ngerti|gimana|🤔)/i.test(userQuery),
        grateful: /(thanks|makasih|appreciate|🙏)/i.test(userQuery)
      };

      const detectedEmotion = Object.keys(emotionalIndicators).find(
        emotion => emotionalIndicators[emotion as keyof typeof emotionalIndicators]
      ) || 'neutral';

      console.log(`💭 [EMOTION] ${detectedEmotion.toUpperCase()}`);

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
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log('🔄 [RETRY] Quota exhausted, rotating key...');
        if (keyPool.length > 1) {
          return await this.chat(messages, userPersona, mode, images, userLocation, useAutoMode);
        }
        throw new Error("API quota habis. Tunggu sebentar atau coba lagi nanti!");
      }

      if (error.message?.includes('image') || error.message?.includes('INVALID_ARGUMENT')) {
        throw new Error("Masalah dengan gambar. Coba compress atau kirim yang lebih kecil!");
      }

      if (error.message?.includes('API key') || error.message?.includes('PERMISSION_DENIED')) {
        throw new Error("Masalah API key. Contact developer!");
      }

      if (error.message?.includes('timeout') || error.message?.includes('DEADLINE_EXCEEDED')) {
        throw new Error("Request timeout. Coba lagi!");
      }
      
      console.error('❌ [ERROR]:', error);
      throw new Error(error.message || "Ada error. Coba lagi!");
    }
  }
};
