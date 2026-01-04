import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

const getAllAvailableKeys = () => {
  const rawKeys = process.env.API_KEY || '';
  return rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

export const geminiService = {
  async chat(
    messages: Message[], 
    userPersona: string, 
    mode: ConversationMode,
    images?: string[],
    userLocation?: { lat: number; lng: number }
  ): Promise<any> {
    const keys = getAllAvailableKeys();
    
    if (keys.length === 0) {
      throw new Error("API_KEY tidak ditemukan di environment variable Vercel.");
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const contentText = (lastUserMessage?.content || "").toLowerCase();
    
    const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize)/i);
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);
    const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) && 
                          contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);
    const needsMaps = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan)/i);

    const systemInstruction = `
ANDA ADALAH RIVAL (BETA). ROLE: MASTER ENGINEER & VISUAL ARCHITECT.
- KODING: Berikan kode HTML/Tailwind/JS lengkap dalam satu blok markdown.
- GAYA: Profesional, cerdas, tanpa simbol bintang (*) untuk bold.
- FITUR: Mampu gambar, cari web, dan navigasi maps.
- PERSONA USER: ${userPersona || "Bersikaplah sangat efisien."}
`;

    // MODEL YANG 100% ADA DAN GRATIS
    let modelName = 'gemini-1.5-flash-latest'; // Default: stable, gratis, cepat
    if (isEbookRequest || isCodeRequest) {
      modelName = 'gemini-1.5-pro-latest'; // Pro: lebih pintar, masih gratis dengan limit
    }

    const contents: any[] = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    if (images && images.length > 0) {
      const lastMessage = contents[contents.length - 1];
      const imageParts = images.map(img => {
        const [header, data] = img.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { inlineData: { mimeType, data } };
      });
      lastMessage.parts = [...imageParts, ...lastMessage.parts];
    }

    let lastErrorMessage = "";
    const maxAttempts = Math.min(3, keys.length);
    const usedKeyIndices = new Set<number>();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * keys.length);
      } while (usedKeyIndices.has(randomIndex) && usedKeyIndices.size < keys.length);
      
      usedKeyIndices.add(randomIndex);
      const activeKey = keys[randomIndex];
      
      try {
        const ai = new GoogleGenAI({ apiKey: activeKey });

        // Image generation DISABLED (butuh Imagen API terpisah)
        if (isImageRequest && !images?.length) {
          return { 
            text: "Fitur generate gambar butuh model khusus yang belum tersedia di package ini. Rival bisa analisis gambar yang lo upload atau bikin kode aplikasi visual.",
            imageUrl: "", 
            codeSnippet: '', 
            sources: [] 
          };
        }

        // Request Standar
        const config: any = { systemInstruction };
        
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
                        layout: { type: Type.STRING } 
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
        let mapData: MapData | undefined;
        
        const codeMatch = text.match(/```(?:html|javascript|css|typescript|xml)?\n([\s\S]*?)```/);
        if (codeMatch) {
          codeSnippet = codeMatch[1].trim();
        }

        if (isEbookRequest) {
          try {
            const parsed = JSON.parse(text);
            text = parsed.assistantMessage || text;
            ebookData = parsed.ebookData;
          } catch (e) {
            console.warn('[RIVAL] Ebook JSON parse failed:', e);
          }
        }

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) {
            return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          }
          if (chunk.maps) {
            if (!mapData) {
              mapData = { 
                title: chunk.maps.title, 
                location: 'Lokasi Terdeteksi', 
                latitude: 0, 
                longitude: 0, 
                uri: chunk.maps.uri 
              };
            }
            return { title: chunk.maps.title, url: chunk.maps.uri, snippet: 'Maps' };
          }
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet, sources, ebookData, mapData };

      } catch (err: any) {
        lastErrorMessage = err.message || "Unknown Error";
        const errorDetails = err.response?.data || err.toString();
        
        console.error(`[RIVAL] Attempt ${attempt + 1}/${maxAttempts} FAILED`, {
          keyIndex: randomIndex,
          model: modelName,
          error: lastErrorMessage,
          details: errorDetails
        });
        
        // Deteksi jenis error
        const isAuthError = lastErrorMessage.toLowerCase().includes('api key') || 
                           lastErrorMessage.toLowerCase().includes('unauthorized') ||
                           lastErrorMessage.toLowerCase().includes('invalid key');
        
        const isQuotaError = lastErrorMessage.toLowerCase().includes('quota') ||
                            lastErrorMessage.toLowerCase().includes('rate limit');
        
        const isModelError = lastErrorMessage.toLowerCase().includes('not found') ||
                            lastErrorMessage.toLowerCase().includes('does not exist');

        // Stop retry kalo masalahnya bukan di key
        if (isModelError) {
          throw new Error(`Model ${modelName} tidak ditemukan. Cek package @google/genai versi terbaru.`);
        }

        if (isAuthError && attempt === 0) {
          console.error('[RIVAL] API Key Invalid! Cek Vercel env variables.');
        }

        // Lanjut ke key berikutnya
      }
    }

    // Semua gagal
    throw new Error(`Rival gagal setelah ${maxAttempts} attempts. Last error: ${lastErrorMessage}`);
  }
};
