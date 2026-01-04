import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

/**
 * RIVAL MULTI-CORE ROTATION SYSTEM
 * Mendukung 1 hingga 50+ API Key yang dipisah dengan koma di environment variable.
 */
const getApiKey = () => {
  const rawKeys = process.env.API_KEY || '';
  if (rawKeys.includes(',')) {
    const keys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    // Randomize antar key yang tersedia untuk load balancing
    return keys[Math.floor(Math.random() * keys.length)];
  }
  return rawKeys;
};

export const geminiService = {
  async chat(
    messages: Message[], 
    userPersona: string, 
    mode: ConversationMode,
    images?: string[],
    userLocation?: { lat: number; lng: number }
  ) {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const contentText = (lastUserMessage?.content || "").toLowerCase();
    
    // Intent Detection
    const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize)/i);
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);
    const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) && 
                          contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);
    const needsMaps = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan)/i);

    // SYSTEM CORE INSTRUCTION - RIVAL BETA
    let systemInstruction = `
        ANDA ADALAH RIVAL (BETA DEPLOYMENT).
        ROLE: MASTER ENGINEER & VISUAL ARCHITECT.

        ATURAN KODING (ARTIFACTS):
        - Jika user minta aplikasi/web/dashboard, ANDA WAJIB MEMBERIKAN KODE UTUH (HTML/Tailwind/JS).
        - Gunakan CDN Tailwind, Lucide Icons, dan GSAP untuk animasi agar aplikasi terlihat premium.
        - Masukkan semua kode dalam SATU blok markdown tunggal (html).
        - Jangan memberikan potongan kode, berikan SOLUSI FINAL yang bisa langsung dijalankan.

        KEMAMPUAN RIVAL:
        - Gambar: Anda bisa men-generate visual apa saja.
        - Search: Gunakan Google Search untuk data terbaru atau link YouTube.
        - UI: User bisa ganti tema, font, dan ui-scale di pengaturan.

        GAYA BAHASA:
        - Profesional, tegas, dan sangat cerdas.
        - JANGAN GUNAKAN MARKDOWN BOLD (bintang *) karena merusak estetika clean UI.
        - ${userPersona || "Fokus pada efisiensi sistem dan kualitas output."}
    `;

    // 1. GENERATE IMAGE (Model: gemini-2.5-flash-image)
    if (isImageRequest && !images?.length) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `Create a professional high-quality visual for: ${contentText}. Style: Ultra-modern, 4k, clean aesthetic.` }] }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let generatedImg = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImg = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return { text: "Visual telah berhasil saya render. Ada yang lain?", imageUrl: generatedImg, codeSnippet: '', sources: [] };
    }

    // 2. TEXT/CODE/SEARCH (Model: Gemini 3 Flash/Pro)
    let modelName = 'gemini-3-flash-preview'; 
    if (isEbookRequest || isCodeRequest) {
      modelName = 'gemini-3-pro-preview'; // Upgrade ke PRO untuk tugas berat
    } else if (needsMaps) {
      modelName = 'gemini-2.5-flash';
    }

    const contents: any[] = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Multi-modal Analysis (Jika user upload gambar)
    if (images && images.length > 0) {
      const lastMessage = contents[contents.length - 1];
      const imageParts = images.map(img => {
        const parts = img.split(',');
        const data = parts[1];
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        return { inlineData: { mimeType, data } };
      });
      lastMessage.parts = [...imageParts, ...lastMessage.parts];
    }

    const config: any = { systemInstruction };

    // Response Formatting
    if (isEbookRequest) {
      config.responseMimeType = "application/json";
      config.responseSchema = {
        type: Type.OBJECT,
        properties: {
          assistantMessage: { type: Type.STRING },
          ebookData: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              pages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING },
                    layout: { type: Type.STRING, enum: ['split', 'hero', 'minimal', 'sidebar', 'feature', 'gallery'] }
                  }
                }
              }
            }
          }
        }
      };
    } else if (needsMaps) {
      config.tools = [{ googleMaps: {} }];
    } else {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    let text = response.text || "";
    let ebookData: EbookData | undefined;
    let codeSnippet = "";
    let sources = [];
    let mapData: MapData | undefined;

    // Artifacts Extraction
    const codeMatch = text.match(/```(?:html|javascript|css|typescript|xml)?\n([\s\S]*?)```/);
    if (codeMatch) {
      codeSnippet = codeMatch[1].trim();
    }

    if (isEbookRequest) {
      try {
        const jsonRes = JSON.parse(text);
        text = jsonRes.assistantMessage;
        ebookData = jsonRes.ebookData;
      } catch (e) { /* fallback */ }
    } else {
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
        if (chunk.maps) {
          if (!mapData) mapData = { title: chunk.maps.title, location: 'Lokasi Terdeteksi', latitude: 0, longitude: 0, uri: chunk.maps.uri };
          return { title: chunk.maps.title, url: chunk.maps.uri, snippet: 'Maps' };
        }
        return null;
      }).filter(Boolean) || [];
    }

    return { text, imageUrl: "", codeSnippet, sources, ebookData, mapData };
  }
};
