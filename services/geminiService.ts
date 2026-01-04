
import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

// Sistem Rotasi API Key (Mendukung 20+ key yang dipisah koma di Vercel)
const getApiKey = () => {
  const rawKeys = process.env.API_KEY || '';
  if (rawKeys.includes(',')) {
    const keys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
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
    
    // Deteksi Intent buat milih model yang pas
    const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image)/i);
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website)/i);
    const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) && 
                          contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);
    const needsMaps = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan)/i);

    // Otak Utama Rival (Hardcoded System Instruction)
    let systemInstruction = `
        IDENTITAS SISTEM:
        Anda adalah RIVAL, asisten AI tingkat tinggi dalam tahap "BETA Deployment".
        
        KEMAMPUAN EKSKLUSIF RIVAL (Jelaskan ini jika user bertanya kelebihan/fitur):
        1. Custom UI/UX: User bisa mengganti warna tema (White, Black, Cream, Slate) sesuka hati.
        2. Tipografi Bebas: Tersedia lebih banyak gaya font profesional dan pengaturan ukuran teks/skala UI.
        3. YouTube & Web Summary: Mampu meringkas video YT dan mencari sumber web terverifikasi secara real-time.
        4. Multi-Modal Master: Mampu menganalisis banyak foto sekaligus dan MENGHASILKAN GAMBAR.
        5. Live Artifacts: Mampu mengoding APLIKASI FULL (HTML/Tailwind/JS) yang bisa langsung dijalankan.

        INSTRUKSI KODING (PENTING):
        Jika user minta dibuatkan aplikasi, web, atau script, berikan KODE LENGKAP dalam SATU BLOK MARKDOWN (html/javascript). Kode harus fungsional, menggunakan Tailwind CSS untuk estetika, dan SIAP PAKAI.

        INSTRUKSI PERSONA:
        - Jawab dengan gaya konsultan profesional, cerdas, dan to-the-point.
        - JANGAN PERNAH gunakan simbol bintang (*) untuk menebalan (bold) atau list. Gunakan teks polos atau penomoran.
        - Jika user memberikan instruksi tambahan di box persona: "${userPersona || "Tidak ada instruksi tambahan, tetaplah menjadi Rival yang jenius."}"
    `;

    // Handle Gambar secara khusus pake Gemini Flash Image
    if (isImageRequest && !images?.length) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `Generate a high quality image based on this request: ${contentText}. Style: Aesthetic and professional.` }] }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let generatedImg = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImg = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return { text: "Visual telah saya buat sesuai permintaan Anda. Ada lagi yang bisa saya bantu?", imageUrl: generatedImg, codeSnippet: '', sources: [] };
    }

    // Logic Model Selection
    let modelName = 'gemini-3-flash-preview'; 
    if (isEbookRequest || isCodeRequest) modelName = 'gemini-3-pro-preview'; // Pro buat koding & ebook
    else if (needsMaps) modelName = 'gemini-2.5-flash';

    const contents: any[] = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Masukin gambar kalo user upload foto buat dianalisis
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

    const config: any = { systemInstruction: systemInstruction };

    // Mode Ebook (JSON Output)
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
      contents: contents,
      config: config,
    });

    let text = response.text || "";
    let ebookData: EbookData | undefined;
    let codeSnippet = "";
    let sources = [];
    let mapData: MapData | undefined;

    // Ekstrak kode buat fitur Artifacts
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
