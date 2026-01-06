import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

// ✅ GLOBAL KEY POOL - API KEY ROTATION
let keyPool: string[] = [];
let keyIndex = 0;

const initKeyPool = () => {
  const rawKeys = process.env.API_KEY || '';
  if (!rawKeys) throw new Error('API_KEY tidak ditemukan di environment variables');
  
  keyPool = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keyPool.length === 0) throw new Error('Tidak ada API key yang valid');
  
  console.log(`✅ Loaded ${keyPool.length} API keys untuk rotation`);
};

// ✅ ROTATE KEY - SETIAP REQUEST PAKE KEY BERBEDA
const getNextApiKey = () => {
  if (keyPool.length === 0) initKeyPool();
  
  const key = keyPool[keyIndex];
  const currentIndex = keyIndex;
  keyIndex = (keyIndex + 1) % keyPool.length;
  
  console.log(`🔑 Using API key #${currentIndex + 1}/${keyPool.length}`);
  return key;
};

// ✅ HELPER: Extract YouTube Video ID
const extractYouTubeId = (text: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// ✅ HELPER: Fetch YouTube Transcript (TANPA LIBRARY!)
const fetchYouTubeTranscript = async (videoId: string): Promise<string | null> => {
  try {
    // Fetch video page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract captions data
    const captionsMatch = html.match(/"captions":\s*(\{[^}]+\})/);
    if (!captionsMatch) return null;
    
    // Try to find transcript URL from playerCaptionsTracklistRenderer
    const trackMatch = html.match(/"captionTracks":\s*\[([^\]]+)\]/);
    if (!trackMatch) return null;
    
    const urlMatch = trackMatch[1].match(/"baseUrl":"([^"]+)"/);
    if (!urlMatch) return null;
    
    const transcriptUrl = urlMatch[1].replace(/\\u0026/g, '&');
    
    // Fetch transcript
    const transcriptResponse = await fetch(transcriptUrl);
    const transcriptXml = await transcriptResponse.text();
    
    // Parse XML to extract text
    const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g);
    if (!textMatches) return null;
    
    const transcript = textMatches
      .map(match => {
        const text = match.replace(/<[^>]+>/g, '');
        return text.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'");
      })
      .join(' ');
    
    return transcript;
  } catch (error) {
    console.error('❌ Failed to fetch transcript:', error);
    return null;
  }
};

export const geminiService = {
  async chat(
    messages: Message[], 
    userPersona: string, 
    mode: ConversationMode,
    images?: string[],
    userLocation?: { lat: number; lng: number }
  ) {
    try {
      if (keyPool.length === 0) initKeyPool();
      
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const contentText = (lastUserMessage?.content || "").toLowerCase();
      
      // ✅ DETECTION LOGIC
      const wantsImage = (
        contentText.includes('gambar') || 
        contentText.includes('lukis') || 
        contentText.includes('draw') || 
        contentText.includes('generate image') || 
        contentText.includes('buatkan visual') ||
        contentText.includes('bikin foto') ||
        contentText.includes('buat gambar')
      ) && !images?.length;
      
      const wantsCode = (
        contentText.includes('buatkan aplikasi') ||
        contentText.includes('bikin aplikasi') ||
        contentText.includes('buat aplikasi') ||
        contentText.includes('buatkan web') ||
        contentText.includes('bikin web') ||
        contentText.includes('buat web') ||
        contentText.includes('kalkulator') ||
        contentText.includes('dashboard') ||
        contentText.includes('landing page') ||
        contentText.includes('todo') ||
        contentText.includes('timer') ||
        contentText.includes('game') ||
        contentText.includes('website') ||
        contentText.includes('aplikasi') ||
        contentText.includes('code') ||
        contentText.includes('coding')
      );
      
      const wantsMaps = (
        contentText.includes('dimana') ||
        contentText.includes('tempat') ||
        contentText.includes('restoran') ||
        contentText.includes('resto') ||
        contentText.includes('kafe') ||
        contentText.includes('cafe') ||
        contentText.includes('hotel') ||
        contentText.includes('wisata') ||
        contentText.includes('lokasi') ||
        contentText.includes('maps') ||
        contentText.includes('cari tempat') ||
        contentText.includes('dekat sini') ||
        contentText.includes('sekitar')
      );

      const wantsYoutube = (
        contentText.includes('youtube') ||
        contentText.includes('video') ||
        contentText.includes('ringkas') ||
        contentText.includes('summarize') ||
        contentText.includes('youtu.be') ||
        extractYouTubeId(lastUserMessage?.content || '') !== null
      );

      // ========================
      // 1️⃣ IMAGE GENERATION
      // ========================
      if (wantsImage) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🎨 [IMAGE] Using gemini-2.5-flash-image...');
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
              parts: [{ 
                text: `Create a professional high-quality image: ${contentText}. Style: modern, clean, 4K resolution.` 
              }]
            }]
          });

          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              generatedImg = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
          
          if (generatedImg) {
            return { 
              text: "Gambar sudah berhasil dibuat! Kualitas premium dan siap digunakan.", 
              imageUrl: generatedImg, 
              codeSnippet: '', 
              sources: [] 
            };
          } else {
            throw new Error('Model tidak mengembalikan image data');
          }
        } catch (imgError: any) {
          console.error('❌ [IMAGE] Error:', imgError.message);
          
          try {
            console.log('🔄 [IMAGE] Fallback to gemini-1.5-flash...');
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-1.5-flash',
              contents: [{
                parts: [{ text: `Generate image: ${contentText}` }]
              }]
            });

            let fallbackImg = "";
            for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                fallbackImg = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }

            if (fallbackImg) {
              return {
                text: "Gambar berhasil dibuat (menggunakan fallback model).",
                imageUrl: fallbackImg,
                codeSnippet: '',
                sources: []
              };
            }
          } catch (fallbackError) {
            console.error('❌ [IMAGE] Fallback also failed:', fallbackError);
          }

          return {
            text: "Maaf, fitur generate gambar sedang mengalami kendala. Silakan coba lagi dalam beberapa saat.",
            imageUrl: "",
            codeSnippet: "",
            sources: []
          };
        }
      }

      // ========================
      // 2️⃣ CODING REQUEST
      // ========================
      if (wantsCode) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('💻 [CODE] Using gemini-2.5-flash...');
        
        const systemPrompt = `Kamu adalah expert full-stack developer yang sangat berpengalaman.

ATURAN WAJIB:
- JANGAN gunakan format markdown bold (tanda bintang ganda) dalam response text
- Berikan kode HTML LENGKAP dan SIAP PAKAI dengan Tailwind CSS dari CDN
- SEMUA fitur harus BERFUNGSI 100%, tanpa placeholder atau TODO comments
- Gunakan https://cdn.tailwindcss.com untuk styling
- Design harus responsive untuk mobile dan desktop
- Code harus clean, readable, dan production-ready
- Tambahkan animasi smooth dan interaktivitas yang baik
- Include proper error handling

FORMAT OUTPUT:
Berikan kode dalam SATU blok code markdown dengan tag html.`;

        const contents: any[] = [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...messages.slice(-5).map(m => ({
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

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents
        });

        let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/\*\*/g, '').replace(/__/g, '');
        
        let codeSnippet = "";
        const codeMatch = text.match(/```(?:html|javascript|css|typescript|jsx|tsx)?\n([\s\S]*?)```/);
        if (codeMatch) {
          codeSnippet = codeMatch[1].trim();
        }

        return { text, imageUrl: "", codeSnippet, sources: [] };
      }

      // ========================
      // 3️⃣ YOUTUBE SUMMARY (ENHANCED!)
      // ========================
      if (wantsYoutube) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('📺 [YOUTUBE] Processing video...');
        
        const videoId = extractYouTubeId(lastUserMessage?.content || '');
        
        // Coba fetch transcript dulu
        if (videoId) {
          const transcript = await fetchYouTubeTranscript(videoId);
          
          if (transcript) {
            console.log(`✅ Transcript fetched: ${transcript.length} characters`);
            
            const enhancedPrompt = `Kamu adalah expert content analyst. Analisis video YouTube ini secara mendalam.

TRANSCRIPT VIDEO:
${transcript.substring(0, 12000)}${transcript.length > 12000 ? '...(dipotong)' : ''}

User request: "${lastUserMessage?.content}"

Berikan analisis PROFESIONAL dengan struktur:

1. RINGKASAN INTI
Poin-poin utama yang dibahas (3-5 poin)

2. KEY INSIGHTS
Insight penting dan takeaway

3. KESIMPULAN
Kesimpulan utama dari video

4. TARGET AUDIENCE
Untuk siapa video ini cocok

5. REKOMENDASI
Worth it untuk ditonton? Mengapa?

Jawab dalam bahasa Indonesia yang natural dan profesional.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: 'user',
                parts: [{ text: enhancedPrompt }]
              }]
            });

            let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            text = text.replace(/\*\*/g, '').replace(/__/g, '');
            
            return { 
              text, 
              imageUrl: "", 
              codeSnippet: "", 
              sources: [{ 
                title: `YouTube Video`, 
                url: `https://youtube.com/watch?v=${videoId}`, 
                snippet: 'Transcript berhasil dianalisis' 
              }] 
            };
          }
        }
        
        // Fallback: Google Search
        console.log('🔄 Fallback to Google Search...');
        
        const contents = messages.slice(-5).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/\*\*/g, '').replace(/__/g, '');
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet: "", sources };
      }

      // ========================
      // 4️⃣ MAPS REQUEST
      // ========================
      if (wantsMaps) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🗺️ [MAPS] Using gemini-2.5-flash + Maps...');
        
        const contents = messages.slice(-5).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            tools: [{ googleMaps: {} }]
          }
        });

        let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/\*\*/g, '').replace(/__/g, '');
        
        let mapData: MapData | undefined;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.maps) {
            if (!mapData) {
              mapData = { 
                title: chunk.maps.title || 'Lokasi', 
                location: chunk.maps.title || 'Ditemukan', 
                latitude: 0, 
                longitude: 0, 
                uri: chunk.maps.uri 
              };
            }
            return { title: chunk.maps.title, url: chunk.maps.uri, snippet: 'Maps' };
          }
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet: "", sources, mapData };
      }

      // ========================
      // 5️⃣ GENERAL CHAT + WEB SEARCH
      // ========================
      const apiKey = getNextApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('💬 [CHAT] Using gemini-2.5-flash + Search...');
      
      const contents: any[] = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      if (images && images.length > 0) {
        const lastMsg = contents[contents.length - 1];
        const imageParts = images.map(img => {
          const [header, data] = img.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          return { inlineData: { mimeType, data } };
        });
        lastMsg.parts = [...imageParts, ...lastMsg.parts];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      text = text.replace(/\*\*/g, '').replace(/__/g, '');
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
        return null;
      }).filter(Boolean) || [];

      return { text, imageUrl: "", codeSnippet: "", sources };

    } catch (error: any) {
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return await this.chat(messages, userPersona, mode, images, userLocation);
      }
      
      console.error('❌ [SERVICE] Error:', error);
      
      let errorMsg = "Maaf, terjadi gangguan teknis. Silakan coba lagi.";
      
      if (error.message?.includes('API key') || error.message?.includes('invalid')) {
        errorMsg = "Ada masalah dengan API key. Mohon periksa konfigurasi environment variables.";
      } else if (error.message?.includes('model')) {
        errorMsg = `Model error: ${error.message}. Silakan coba lagi atau gunakan fitur lain.`;
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
  }
};
