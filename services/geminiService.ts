import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

// ✅ GLOBAL KEY POOL
let keyPool: string[] = [];
let keyIndex = 0;

const initKeyPool = () => {
  const rawKeys = process.env.API_KEY || '';
  if (!rawKeys) throw new Error('API_KEY tidak ada');
  
  keyPool = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keyPool.length === 0) throw new Error('API key invalid');
  
  console.log(`✅ Loaded ${keyPool.length} API keys`);
};

// ✅ ROTATE KEY - SETIAP KALI DIPANGGIL DAPET KEY BEDA
const getNextApiKey = () => {
  if (keyPool.length === 0) initKeyPool();
  
  const key = keyPool[keyIndex];
  keyIndex = (keyIndex + 1) % keyPool.length; // Circular rotation
  
  console.log(`🔑 Using key ${keyIndex + 1}/${keyPool.length}`);
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
      // Initialize key pool jika belum
      if (keyPool.length === 0) initKeyPool();
      
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const contentText = (lastUserMessage?.content || "").toLowerCase();
      
      // ✅ DETECTION
      const wantsImage = (
        contentText.includes('gambar') || 
        contentText.includes('lukis') || 
        contentText.includes('draw') || 
        contentText.includes('generate image') || 
        contentText.includes('buatkan visual') ||
        contentText.includes('bikin foto')
      ) && !images?.length;
      
      const wantsCode = (
        contentText.includes('buatkan aplikasi') ||
        contentText.includes('bikin aplikasi') ||
        contentText.includes('buat aplikasi') ||
        contentText.includes('buatkan web') ||
        contentText.includes('bikin web') ||
        contentText.includes('kalkulator') ||
        contentText.includes('dashboard') ||
        contentText.includes('landing page') ||
        contentText.includes('todo') ||
        contentText.includes('timer') ||
        contentText.includes('game') ||
        contentText.includes('website')
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
        contentText.includes('cari tempat')
      );

      // ========================
      // 1️⃣ IMAGE GENERATION
      // ========================
      if (wantsImage) {
        const apiKey = getNextApiKey(); // ✅ KEY BEDA
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🎨 Generating image with gemini-1.5-flash...');
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{
              parts: [{ 
                text: `Generate a professional high-quality image for: ${contentText}` 
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
              text: "Gambar sudah jadi! Kualitas tinggi dan siap pakai.", 
              imageUrl: generatedImg, 
              codeSnippet: '', 
              sources: [] 
            };
          }
        } catch (imgError: any) {
          console.error('Image gen failed:', imgError);
          return {
            text: "Maaf, fitur generate gambar sedang error. Coba lagi atau minta yang lain.",
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
        const apiKey = getNextApiKey(); // ✅ KEY BEDA LAGI
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('💻 Generating code with gemini-2.5-flash...');
        
        const systemPrompt = `Kamu adalah expert full-stack developer. 

ATURAN PENTING:
- JANGAN gunakan format bold (bintang bintang) dalam text response
- Berikan kode HTML LENGKAP dengan Tailwind CSS dari CDN
- Semua fitur harus BERFUNGSI 100 persen, tidak ada placeholder
- Gunakan https://cdn.tailwindcss.com untuk styling
- Responsive untuk mobile dan desktop
- Code harus clean dan production-ready
- Tambahkan animasi smooth jika perlu

Berikan kode dalam satu blok code markdown html.`;

        const contents: any[] = [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...messages.slice(-3).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ];

        // Handle images untuk UI reference
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
        text = text.replace(/\*\*/g, '');
        
        let codeSnippet = "";
        const codeMatch = text.match(/```(?:html|javascript|css|typescript|jsx|tsx)?\n([\s\S]*?)```/);
        if (codeMatch) {
          codeSnippet = codeMatch[1].trim();
        }

        return { text, imageUrl: "", codeSnippet, sources: [] };
      }

      // ========================
      // 3️⃣ MAPS REQUEST
      // ========================
      if (wantsMaps) {
        const apiKey = getNextApiKey(); // ✅ KEY BEDA LAGI
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🗺️ Processing maps with gemini-2.5-flash...');
        
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
        text = text.replace(/\*\*/g, '');
        
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
      // 4️⃣ GENERAL CHAT + SEARCH
      // ========================
      const apiKey = getNextApiKey(); // ✅ KEY BEDA LAGI
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('💬 General chat with gemini-2.5-flash...');
      
      const contents: any[] = messages.slice(-8).map(m => ({
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
      text = text.replace(/\*\*/g, '');
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
        return null;
      }).filter(Boolean) || [];

      return { text, imageUrl: "", codeSnippet: "", sources };

    } catch (error: any) {
      console.error('❌ Error:', error);
      
      let errorMsg = "Maaf, ada gangguan teknis.";
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "Quota habis di key ini, sistem auto-switch ke key lain.";
      } else if (error.message?.includes('API')) {
        errorMsg = "Ada masalah dengan API key.";
      }
      
      throw new Error(errorMsg);
    }
  }
};
