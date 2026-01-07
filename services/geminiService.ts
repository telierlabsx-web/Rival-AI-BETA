import { GoogleGenAI } from "@google/genai";
import { Message, ConversationMode, MapData } from "../types";

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

// ✅ SMART CASUAL PROMPT - AI yang kayak temen ngobrol!
const SMART_CASUAL_PROMPT = `Kamu adalah AI assistant yang santai, ramah, dan nyaman diajak ngobrol kayak temen deket.

🎯 PRINSIP UTAMA: SESUAIKAN ENERGY USER!

**RULE #1: DETEKSI PANJANG INPUT**
- Input 1-10 kata (hai, halo, apa kabar, gimana, dll) → Balas 1-2 kalimat SANTAI. JANGAN pake formatting apapun!
- Input 11-50 kata → Balas natural 2-4 paragraf
- Input 50+ kata / pertanyaan kompleks → Baru pakai struktur lengkap

**CONTOH CHAT SANTAI:**
User: "Hai"
AI: "Hai! Ada yang bisa aku bantu?"

User: "Apa kabar?"
AI: "Baik! Gimana kabarmu? Ada yang mau dibahas?"

User: "Lagi bosen nih"
AI: "Wah sama! Mau dicariin topik seru atau butuh rekomendasi sesuatu?"

**UNTUK PERTANYAAN SERIUS/PANJANG, BARU PAKAI STRUKTUR:**

## Heading Kalo Perlu

Penjelasan dengan paragraf yang rapi.

- **Bullet point** kalo ada list
- Item kedua
- Item ketiga

| Kolom 1 | Kolom 2 |
|---------|---------|
| Data A  | Data B  |

> Quote kalo perlu emphasis

❌ PANTANGAN:
- JANGAN over-explain untuk chat santai
- JANGAN ceramah kalo user cuma sapa
- JANGAN pake heading/tabel kalo ga perlu
- JANGAN formal kalo user santai

✅ PRINSIP:
- Santai = jawab santai
- Serius = jawab serius
- Pendek = jawab pendek
- Panjang = jawab lengkap

Kamu temen ngobrol yang enak, bukan robot formal!`;

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
        contentText.includes('youtu.be')
      );

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
              text: "Done! Gambarnya udah jadi nih. Gimana, sesuai yang diharapkan?", 
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
                text: "Oke jadi juga nih gambarnya! Coba dicek ya.",
                imageUrl: fallbackImg,
                codeSnippet: '',
                sources: []
              };
            }
          } catch (fallbackError) {
            console.error('❌ [IMAGE] Fallback also failed:', fallbackError);
          }

          return {
            text: "Waduh, lagi error nih fitur gambarnya. Coba lagi nanti ya atau request yang lain dulu!",
            imageUrl: "",
            codeSnippet: "",
            sources: []
          };
        }
      }

      if (wantsCode) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('💻 [CODE] Using gemini-2.5-flash...');
        
        const systemPrompt = `Kamu adalah expert developer yang ramah dan helpful.

ATURAN:
- Berikan kode HTML LENGKAP dengan Tailwind CSS dari CDN
- SEMUA fitur harus BERFUNGSI 100%
- Gunakan https://cdn.tailwindcss.com
- Design responsive mobile/desktop
- Clean, production-ready code

FORMAT OUTPUT:
1. Intro singkat & friendly (1-2 kalimat)
2. Kode dalam blok markdown
3. Tips kalau perlu`;

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
        
        let codeSnippet = "";
        const codeMatch = text.match(/```(?:html|javascript|css|typescript|jsx|tsx)?\n([\s\S]*?)```/);
        if (codeMatch) {
          codeSnippet = codeMatch[1].trim();
        }

        return { text, imageUrl: "", codeSnippet, sources: [] };
      }

      if (wantsYoutube) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('📺 [YOUTUBE] Using gemini-2.5-flash + Search...');
        
        const contents = [
          {
            role: 'user',
            parts: [{ text: SMART_CASUAL_PROMPT }]
          },
          ...messages.slice(-5).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet: "", sources };
      }

      if (wantsMaps) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🗺️ [MAPS] Using gemini-2.5-flash + Maps...');
        
        const contents = [
          {
            role: 'user',
            parts: [{ text: SMART_CASUAL_PROMPT }]
          },
          ...messages.slice(-5).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            tools: [{ googleMaps: {} }]
          }
        });

        let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
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

      const apiKey = getNextApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('💬 [CHAT] Using gemini-2.5-flash + Search...');
      
      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: SMART_CASUAL_PROMPT }]
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
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
