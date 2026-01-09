import { GoogleGenAI } from "@google/genai";
import { Message, ConversationMode, MapData } from "../types";
import { detectQueryComplexity, AIMode } from "../lib/autoModeSelector";
import { detectCodeIntent, CodeIntent } from "../lib/codeIntentDetector";
import { getEnhancedCodingPrompt } from "../lib/codingPromptEnhancer";

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
- **Coding Expert**: Full-stack development (React, Node.js, Python, dll)
- **Real-time Maps**: OpenStreetMap integration dengan dark mode
- **Web Search**: Real-time news & information retrieval
- **Offline Mode**: Menggunakan model Qwen untuk operasi offline
- **Multi-modal**: Text, code, image analysis, location services

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

🎨 **KAPAN BIKIN GAMBAR:**
Kalo user minta visual/gambar/ilustrasi (contoh: "bikin gambar sunset", "buatin logo", "lukis pemandangan"), lo langsung tau harus generate image. TAPI jangan assume - kalo ragu, tanya dulu atau langsung jawab normal.

💻 **CODING EXPERT - FULL STACK MASTER:**

**PRINSIP UTAMA:**
- Lo BUKAN cuma HTML/Tailwind expert - lo FULL STACK DEVELOPER HANDAL!
- Bisa: React, Vue, Angular, Node.js, Python, Django, Flask, Express, Next.js, Svelte
- Bisa: Database (SQL, MongoDB, PostgreSQL, Firebase)
- Bisa: API, Backend, Frontend, Mobile (React Native, Flutter)
- Bisa: Game dev (Three.js, Phaser, Unity concepts)
- SELALU provide PRODUCTION-READY CODE

**APPROACH CODING:**
1. Tentuin tech stack terbaik sesuai request
2. Kasih arsitektur/struktur project kalo perlu
3. Code LENGKAP & WORKING - jangan placeholder
4. Include dependencies, setup instructions
5. Optimize & best practices

**CONTOH RESPONSES:**

User: "Bikin todo app"
→ Tanya: "Mau pakai framework apa? React, Vue, atau vanilla? Butuh backend ga?"

User: "Butuh REST API untuk user authentication"
→ Kasih pilihan: "Mau pakai Node.js + Express + JWT, atau Python + Flask? Atau mau yang full-stack Next.js?"

User: "Bikin game sederhana"
→ "Mau game jenis apa? Puzzle, arcade, platformer? Bisa gue bikinin pakai vanilla JS + Canvas, atau mau pakai Phaser framework?"

**FORMAT OUTPUT CODING:**
1. Brief explanation (1-2 kalimat friendly)
2. Tech stack & dependencies
3. FULL CODE dalam code block
4. Setup/usage instructions
5. Tips atau next steps

📚 **SEARCH & RESEARCH:**
- Kalo butuh info terkini, search web dulu
- Verifikasi fakta dari multiple sources
- Kasih context & explain findings
- Link sources kalo relevan

🗺️ **MAPS & LOKASI - AUTO RESPONSE FORMAT:**

Kalau user nanya lokasi, tempat, atau alamat (contoh: "Dimana Monas?", "Lokasi Candi Borobudur", "Cari kafe di Bandung"), kamu HARUS response dengan format ini:

[LOCATION_DATA]
{
  "title": "Nama Tempat",
  "location": "Deskripsi Singkat Lokasi",
  "latitude": -6.1754,
  "longitude": 106.8272
}
[/LOCATION_DATA]

**CONTOH RESPONSE:**

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

❌ **FORMATTING RULES:**
- Chat santai (< 10 kata) → 1-2 kalimat, NO formatting
- Pertanyaan biasa → Paragraf natural, minimal bullets
- Request kompleks/coding → Structured dengan headers, code blocks, bullets
- JANGAN over-format kalo ga perlu

✨ **EMOTIONAL INTELLIGENCE:**
- Detect mood dari cara nulis user
- Adjust tone accordingly (supportive, excited, calm, funny)
- Kasih encouragement kalo user stuck
- Celebrate wins ("Mantap!", "Keren nih!", "Oke sip!")
- Empati kalo user frustrated ("Gue ngerti sih frustasi.. yuk gue bantu pelan-pelan")

🎯 **PRINSIP AKHIR:**
LO ADALAH TEMEN YANG PINTER, LUCU, HELPFUL, DAN ALWAYS DELIVER VALUE.
Bukan robot kaku. Bukan AI formal. Lo adalah companion yang bikin user nyaman & produktif.

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
      
      const isCanvasMode = mode === 'canvas';
      let codeIntent: CodeIntent = 'CASUAL_CHAT';
      let shouldCreateArtifact = false;
      
      if (messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
          const intentResult = detectCodeIntent(lastUserMessage.content, isCanvasMode);
          codeIntent = intentResult.intent;
          shouldCreateArtifact = intentResult.shouldCreateArtifact;
          
          console.log(`🎨 [CODE INTENT] Detected: ${codeIntent}, Artifact: ${shouldCreateArtifact}`);
        }
      }
      
      console.log(`💬 [CHAT] Mode: ${mode.toUpperCase()}, Auto: ${useAutoMode ? selectedMode.toUpperCase() : 'OFF'}`);
      
      let systemPrompt = ENHANCED_AI_PROMPT;
      
      if (codeIntent === 'CODE_CREATION' || codeIntent === 'CODE_DEBUG') {
        const lastUserMessage = messages[messages.length - 1];
        const codingEnhancement = getEnhancedCodingPrompt(
          codeIntent,
          lastUserMessage.content,
          isCanvasMode
        );
        
        systemPrompt += '\n\n' + codingEnhancement;
        console.log('🚀 [ENHANCED] Injected advanced coding rules');
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
      
      let codeSnippet = "";
      const codeMatch = text.match(/```(?:html|javascript|typescript|python|jsx|tsx|css|json|bash|sql|java|cpp|go|rust|php|ruby|swift|kotlin|xml|yaml|markdown|md)?\n([\s\S]*?)```/);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
        
        console.log(`📝 [CODE] Extracted ${codeSnippet.length} characters`);
        
        if (codeSnippet.includes('TODO') || codeSnippet.includes('implement')) {
          console.warn('⚠️ [CODE] Contains placeholders - AI may need guidance');
        }
      }
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: any[] = [];
      let groundingMapData: MapData | undefined;
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({ 
              title: chunk.web.title, 
              url: chunk.web.uri, 
              snippet: '' 
            });
          }
          if (chunk.maps && !groundingMapData) {
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
      
      const finalMapData = extractedMapData || groundingMapData;
      
      const wantsToGenerateImage = text.toLowerCase().includes('[generate_image]') || 
                                   text.toLowerCase().includes('generating image');
      
      let imageUrl = "";
      if (wantsToGenerateImage && !images?.length) {
        console.log('🎨 [IMAGE] AI requested image generation...');
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
              parts: [{ 
                text: `Create a professional high-quality image based on: ${messages[messages.length - 1].content}` 
              }]
            }]
          });

          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgError: any) {
          console.error('❌ [IMAGE] Error:', imgError.message);
          text += "\n\n(Note: Tried to generate image but encountered an error)";
        }
      }

      return { 
        text, 
        imageUrl, 
        codeSnippet, 
        sources,
        mapData: finalMapData,
        ebookData: undefined,
        aiMode: useAutoMode ? selectedMode : undefined,
        shouldShowArtifactCard: shouldCreateArtifact && isCanvasMode && codeSnippet.length > 0,
        codeIntent
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
