import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

// ✅ API KEY ROTATION - 10 keys berputar
const getApiKey = () => {
  const rawKeys = process.env.API_KEY || '';
  
  if (!rawKeys) {
    throw new Error('API_KEY tidak ditemukan di environment variables');
  }
  
  // Split by comma, trim, filter empty
  const keys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    throw new Error('Tidak ada API key yang valid');
  }
  
  // Random selection untuk load balancing
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  console.log(`Using API key ${keys.indexOf(selectedKey) + 1} of ${keys.length}`);
  
  return selectedKey;
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
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const contentText = (lastUserMessage?.content || "").toLowerCase();
      
      // ✅ DETECTION LOGIC
      const isImageGenRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize|buat visual)/i) && !images?.length;
      const isYoutubeRequest = contentText.match(/(youtube|video|ringkas|summarize|https?:\/\/(www\.)?(youtube\.com|youtu\.be))/i);
      const isMapsRequest = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan|cari tempat|resto|kafe|cafe)/i);
      const isCodeRequest = contentText.match(/(buatkan aplikasi|bikin web|buat website|coding|koding|dashboard|landing page|web app|sistem|program|script)/i);
      
      // ✅ SYSTEM INSTRUCTION - CLEAN & PROFESSIONAL
      let systemInstruction = `Kamu adalah RIVAL, AI assistant yang sangat cerdas dan profesional.

ATURAN PENTING:
1. JANGAN PERNAH gunakan format bold markdown (** atau __) dalam response
2. Gunakan bahasa yang natural, hangat, dan profesional
3. Jawab langsung to the point tanpa basa-basi berlebihan
4. Jika diminta coding, berikan kode LENGKAP dan SIAP PAKAI dalam satu blok code

KEMAMPUAN:
- Generate gambar berkualitas tinggi
- Search web untuk informasi terkini
- Analisis video YouTube dan berikan ringkasan lengkap
- Tampilkan lokasi di maps
- Coding aplikasi web full-stack dengan kualitas production-ready
- Conversation yang nyaman dan helpful

CODING STANDARDS (jika diminta coding):
- Berikan kode HTML lengkap dengan Tailwind CSS dari CDN
- Gunakan https://cdn.tailwindcss.com untuk styling
- Semua fitur harus BERFUNGSI penuh, no placeholder
- Responsive design untuk mobile & desktop
- Include icons dari Lucide atau heroicons
- Animasi smooth dengan CSS atau GSAP jika perlu
- Code clean, commented, dan production-ready

PERSONA: ${userPersona || "Profesional, helpful, dan efisien"}`;

      // ========================
      // 1️⃣ IMAGE GENERATION
      // ========================
      if (isImageGenRequest) {
        console.log('🎨 Generating image...');
        
        const imagePrompt = `Create a high-quality professional image: ${contentText}. 
Style: Modern, clean, 4K quality, professional composition.`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ parts: [{ text: imagePrompt }] }],
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
            text: "Gambar sudah saya buat. Kualitas premium, siap digunakan!", 
            imageUrl: generatedImg, 
            codeSnippet: '', 
            sources: [] 
          };
        } else {
          throw new Error('Gagal generate gambar, model tidak mengembalikan image data');
        }
      }

      // ========================
      // 2️⃣ YOUTUBE VIDEO SUMMARY
      // ========================
      if (isYoutubeRequest) {
        console.log('📺 Processing YouTube request...');
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet: "", sources };
      }

      // ========================
      // 3️⃣ MAPS REQUEST
      // ========================
      if (isMapsRequest) {
        console.log('🗺️ Processing maps request...');
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          config: {
            systemInstruction,
            tools: [{ googleMaps: {} }]
          }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        let mapData: MapData | undefined;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.maps) {
            if (!mapData) {
              mapData = { 
                title: chunk.maps.title || 'Lokasi', 
                location: 'Lokasi Ditemukan', 
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
      // 4️⃣ CODING REQUEST
      // ========================
      if (isCodeRequest) {
        console.log('💻 Processing coding request...');
        
        const contents: any[] = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        // Handle uploaded images (untuk UI reference)
        if (images && images.length > 0) {
          const lastMessage = contents[contents.length - 1];
          const imageParts = images.map(img => {
            const [header, data] = img.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            return { inlineData: { mimeType, data } };
          });
          lastMessage.parts = [...imageParts, ...lastMessage.parts];
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', // Premium model untuk coding
          contents,
          config: { systemInstruction }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Extract code
        let codeSnippet = "";
        const codeMatch = text.match(/```(?:html|javascript|css|typescript|jsx|tsx)?\n([\s\S]*?)```/);
        if (codeMatch) {
          codeSnippet = codeMatch[1].trim();
        }

        return { text, imageUrl: "", codeSnippet, sources: [] };
      }

      // ========================
      // 5️⃣ GENERAL CHAT + WEB SEARCH
      // ========================
      console.log('💬 Processing general chat...');
      
      const contents: any[] = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Handle uploaded images (untuk analyze)
      if (images && images.length > 0) {
        const lastMessage = contents[contents.length - 1];
        const imageParts = images.map(img => {
          const [header, data] = img.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          return { inlineData: { mimeType, data } };
        });
        lastMessage.parts = [...imageParts, ...lastMessage.parts];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract sources dari web search
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
        return null;
      }).filter(Boolean) || [];

      return { text, imageUrl: "", codeSnippet: "", sources };

    } catch (error: any) {
      console.error('❌ Gemini Service Error:', error);
      
      // User-friendly error messages
      let errorMsg = "Maaf, saya sedang mengalami gangguan teknis.";
      
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "API quota habis. Sistem akan otomatis rotate ke key lain. Coba lagi sebentar.";
      } else if (error.message?.includes('API key') || error.message?.includes('invalid')) {
        errorMsg = "Ada masalah dengan API key. Mohon cek environment variables.";
      } else if (error.message?.includes('model')) {
        errorMsg = "Model yang diminta tidak tersedia. Sudah diganti ke model alternatif.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      throw new Error(errorMsg);
    }
  }
};
