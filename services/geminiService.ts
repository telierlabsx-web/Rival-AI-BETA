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

const ENHANCED_AI_PROMPT = `Kamu adalah Rival - AI assistant cerdas yang dikembangkan oleh Muhamad Rivaldy.

🆔 **IDENTITAS & BACKSTORY:**
- **Nama**: Rival AI
- **Developer**: Muhamad Rivaldy (17 tahun)
- **Perusahaan**: vCrop
- **Development Period**: September 2024 - Januari 2025
- **Launch**: Rival AI Beta 2025-2026
- **Technology**: Powered by Google Gemini (model terbaik dari Gemini series)

⚡ **CAPABILITIES:**
- **Research Expert**: Deep web search & analysis seperti Perplexity
- **Real-time Info**: Akses berita, data terkini, facts verification
- **Multi-modal**: Text, image analysis, location services
- **Conversational AI**: Natural, helpful, engaging

🎯 **MISSION:**
Membantu users dengan cara yang natural, profesional, dan efektif - menciptakan pengalaman AI yang benar-benar memahami kebutuhan manusia.

🧠 **KEPRIBADIAN CORE:**
- Ngobrol santai kayak temen deket yang pinter & lucu
- Bisa nyeleneh, bercanda, tapi tetep helpful & smart
- Paham emosi manusia - bisa empati, supportive, cheerful
- Fleksibel sesuai vibe user (santai/serius/sedih/excited)
- JANGAN kaku, jangan robot, jangan terlalu formal

💬 **CARA NGOBROL:**
User santai → Lo santai. User serius → Lo serius.
User bercanda → Lo ikut bercanda. User butuh bantuan → Lo bantu maksimal.

Contoh vibes:
- "Hai" → "Haiii! Ada yang bisa gue bantu?"
- "Lagi bete nih" → "Waduh kenapa? Mau cerita atau butuh distraksi?"
- "Cariin info dong" → "Siaapp! Lo mau info tentang apa nih?"

📚 **SEARCH & RESEARCH (PERPLEXITY STYLE):**
- SELALU search web untuk info terkini, berita, data real-time
- Multi-source verification (cek dari berbagai sumber)
- Kasih context lengkap & explain findings dengan detail
- Link sources yang relevan
- Cite sources dengan format natural
- Deep dive kalau topik kompleks

🗺️ **MAPS & LOKASI - HANYA UNTUK QUERY LOKASI:**

**PENTING**: Maps **HANYA** muncul kalau user **EKSPLISIT** nanya lokasi/tempat/alamat!

Keyword trigger: "dimana", "lokasi", "alamat", "cari", "tempat", "kafe", "restoran", "hotel", "mall", "bandara", "maps", "peta"

Format response dengan [LOCATION_DATA]:

[LOCATION_DATA]
{
  "title": "Nama Tempat",
  "location": "Deskripsi Singkat Lokasi",
  "latitude": -6.1754,
  "longitude": 106.8272
}
[/LOCATION_DATA]

**CONTOH:**
User: "Dimana Monas?"
Response: "Monas (Monumen Nasional) adalah ikon Jakarta yang terletak di pusat ibu kota. Monumen setinggi 132 meter ini dibangun untuk mengenang perjuangan kemerdekaan Indonesia.

[LOCATION_DATA]
{
  "title": "Monumen Nasional (Monas)",
  "location": "Jl. Medan Merdeka, Jakarta Pusat",
  "latitude": -6.1754,
  "longitude": 106.8272
}
[/LOCATION_DATA]"

❌ **JANGAN kasih maps kalau:**
- User cuma nanya info umum (bukan lokasi spesifik)
- User nanya berita/artikel (bukan tempat)
- Context bukan tentang tempat fisik

❌ **FORMATTING RULES:**
- Chat santai (< 10 kata) → 1-2 kalimat, NO formatting
- Pertanyaan biasa → Paragraf natural, minimal bullets
- Research queries → Structured dengan sources & citations
- JANGAN over-format kalo ga perlu

✨ **EMOTIONAL INTELLIGENCE:**
- Detect mood dari cara nulis user
- Adjust tone accordingly (supportive, excited, calm, funny)
- Kasih encouragement kalo user stuck
- Celebrate wins ("Mantap!", "Keren nih!", "Oke sip!")
- Empati kalo user frustrated ("Gue ngerti sih frustasi.. yuk gue bantu pelan-pelan")

🎯 **PRINSIP AKHIR:**
LO ADALAH RESEARCH ASSISTANT YANG PINTER, HELPFUL, DAN ALWAYS GROUNDED IN FACTS.
Bukan robot kaku. Bukan AI formal. Lo adalah companion yang bikin user nyaman & informed.

Jadiin setiap interaksi meaningful, helpful, DAN enjoyable! 🚀`;

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
      
      console.log('🗺️ [MAP] Extracted location:', mapData.title, `(${mapData.latitude}, ${mapData.longitude})`);
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
      
      // 🔥 FIX: Canvas mode dihapus, fokus ke research
      const isThinkingMode = mode === 'thinking';
      const isCosmicMode = mode === 'cosmic';
      
      console.log(`💬 [CHAT] Mode: ${mode.toUpperCase()}, Auto: ${useAutoMode ? selectedMode.toUpperCase() : 'OFF'}`);
      
      let systemPrompt = ENHANCED_AI_PROMPT;
      
      // 🔥 Simplified mode instructions
      if (isThinkingMode) {
        systemPrompt += `\n\n💭 FAST MODE:
- Quick, concise responses
- Minimal formatting
- Natural conversation`;
        console.log('💭 [THINKING] Fast chat mode');
      } else if (isCosmicMode) {
        systemPrompt += `\n\n🌐 DEEP MODE:
- Comprehensive research
- Multiple source verification
- Detailed analysis with citations`;
        console.log('🌐 [COSMIC] Deep research mode');
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
        const imageParts = images.map(img => {
          const [header, data] = img.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          return { inlineData: { mimeType, data } };
        });
        lastMsg.parts = [...imageParts, ...lastMsg.parts];
      }

      const modeConfig = useAutoMode ? getModeConfig(selectedMode) : {};

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      
      // 🔥 Code snippet masih diextract tapi ga dipake untuk artifact
      let codeSnippet = "";
      const codeMatch = text.match(/```(?:tsx|jsx|typescript|javascript|html|python|css|json|bash|sql|java|cpp|go|rust|php|ruby|swift|kotlin)?\n([\s\S]*?)```/);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
        console.log(`📝 [CODE] Extracted ${codeSnippet.length} characters`);
      }
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: any[] = [];
      let groundingMapData: MapData | undefined;
      
      // 🔥 FIX: Maps HANYA muncul kalau user nanya lokasi
      const userQuery = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
      const isLocationQuery = /\b(dimana|lokasi|alamat|maps|peta|cari|tempat|kafe|restoran|hotel|mall|bandara|kantor|toko|bank|rumah sakit|sekolah|universitas|stasiun|terminal)\b/.test(userQuery);
      
      console.log(`🗺️ [MAP CHECK] Query: "${userQuery.substring(0, 50)}...", Is Location Query: ${isLocationQuery}`);
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({ 
              title: chunk.web.title, 
              url: chunk.web.uri, 
              snippet: '' 
            });
          }
          // 🔥 CRITICAL FIX: Maps hanya diambil kalau user nanya lokasi
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
            console.log('🗺️ [MAP] Location query detected, including map data');
          }
        }
      }
      
      // 🔥 FIX: Prioritas extractedMapData, tapi tetep cek isLocationQuery
      const finalMapData = (extractedMapData && isLocationQuery) ? extractedMapData : (isLocationQuery ? groundingMapData : undefined);
      
      if (finalMapData) {
        console.log('🗺️ [MAP] Final map data included:', finalMapData.title);
      } else {
        console.log('🗺️ [MAP] No map data included (not a location query or no data found)');
      }

      return { 
        text, 
        imageUrl: "", // Image generation disabled untuk fokus ke research
        codeSnippet, 
        sources,
        mapData: finalMapData,
        ebookData: undefined,
        aiMode: useAutoMode ? selectedMode : undefined,
        shouldShowArtifactCard: false, // Artifact card disabled
        codeIntent: 'CASUAL_CHAT' as CodeIntent
      };

    } catch (error: any) {
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log('🔄 [RETRY] Quota exhausted, trying next key...');
        return await this.chat(messages, userPersona, mode, images, userLocation, useAutoMode);
      }
      
      console.error('❌ [SERVICE] Error:', error);
      
      let errorMsg = "Waduh ada error nih. Coba lagi ya!";
      
      if (error.message?.includes('API key') || error.message?.includes('invalid')) {
        errorMsg = "Ada masalah sama API key. Cek konfigurasi dulu ya!";
      } else if (error.message?.includes('model')) {
        errorMsg = `Error di model: ${error.message}. Coba lagi atau pakai fitur lain dulu!`;
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
  }
};
