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
        contentText.includes('buat gambar') ||
        contentText.includes('create image') ||
        contentText.includes('generate picture')
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
        contentText.includes('youtu.be')
      );

      // ========================
      // 1️⃣ IMAGE GENERATION (FIXED)
      // ========================
      if (wantsImage) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🎨 [IMAGE] Attempting image generation...');
        
        // ✅ FIX: Coba model imagen-3.0-generate-001 dulu (model stabil)
        try {
          console.log('🎨 [IMAGE] Using imagen-3.0-generate-001...');
          const response = await ai.models.generateContent({
            model: 'imagen-3.0-generate-001',
            contents: [{
              parts: [{ 
                text: `Create a professional high-quality image: ${lastUserMessage?.content}. Style: modern, clean, detailed, 4K resolution.` 
              }]
            }]
          });

          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              generatedImg = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          
          if (generatedImg) {
            return { 
              text: "Gambar berhasil dibuat dengan kualitas premium!", 
              imageUrl: generatedImg, 
              codeSnippet: '', 
              sources: [] 
            };
          }
        } catch (imgError: any) {
          console.error('❌ [IMAGE] imagen-3.0 error:', imgError.message);
        }

        // ✅ FALLBACK 1: Coba gemini-2.0-flash-exp
        try {
          console.log('🔄 [IMAGE] Fallback to gemini-2.0-flash-exp...');
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{
              parts: [{ 
                text: `Generate a detailed image: ${lastUserMessage?.content}` 
              }]
            }]
          });

          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              generatedImg = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          
          if (generatedImg) {
            return {
              text: "Gambar berhasil dibuat!",
              imageUrl: generatedImg,
              codeSnippet: '',
              sources: []
            };
          }
        } catch (fallbackError) {
          console.error('❌ [IMAGE] gemini-2.0-flash-exp error:', fallbackError);
        }

        // ✅ FALLBACK 2: Coba gemini-1.5-pro (lebih stabil)
        try {
          console.log('🔄 [IMAGE] Fallback to gemini-1.5-pro...');
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: [{
              parts: [{ 
                text: `Create image: ${lastUserMessage?.content}` 
              }]
            }]
          });

          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              generatedImg = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          
          if (generatedImg) {
            return {
              text: "Gambar berhasil dibuat!",
              imageUrl: generatedImg,
              codeSnippet: '',
              sources: []
            };
          }
        } catch (fallback2Error) {
          console.error('❌ [IMAGE] gemini-1.5-pro error:', fallback2Error);
        }

        // Kalau semua gagal
        return {
          text: "Maaf, fitur generate gambar sedang tidak tersedia. Ini bisa terjadi karena:\n\n1. Model Imagen belum aktif di API key kamu\n2. Quota sudah habis\n3. Request terlalu kompleks\n\nSilakan coba lagi nanti atau hubungi support untuk mengaktifkan Imagen API.",
          imageUrl: "",
          codeSnippet: "",
          sources: []
        };
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
      // 3️⃣ YOUTUBE SUMMARY
      // ========================
      if (wantsYoutube) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('📺 [YOUTUBE] Using gemini-2.5-flash + Search...');
        
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
