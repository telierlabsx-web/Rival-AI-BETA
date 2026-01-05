
import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

/**
 * RIVAL SMART ROTATION & SANITIZATION SYSTEM
 * Mengambil daftar key dari environment variable dan membersihkan karakter aneh.
 */
const getAllAvailableKeys = () => {
  // Mencoba beberapa kemungkinan nama variable yang sering digunakan di platform deployment
  const rawKeys = process.env.API_KEY || (process.env as any).VITE_API_KEY || (process.env as any).GEMINI_API_KEY || '';
  
  return rawKeys
    .split(',')
    .map(k => k.trim())
    .map(k => k.replace(/[\n\r\t]/g, "")) // Hapus karakter newline/tab tersembunyi
    .filter(k => k.length > 5); // Hanya ambil string yang valid sebagai API Key
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
      throw new Error("API_KEY TIDAK TERDETEKSI. Pastikan variable bernama 'API_KEY' sudah di-set di Vercel Settings -> Environment Variables.");
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const contentText = (lastUserMessage?.content || "").toLowerCase();
    
    // Identifikasi Intent
    const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize)/i);
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);
    const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) && 
                          contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);
    const needsMaps = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan)/i);

    // Hardcoded Intelligence Core
    const systemInstruction = `
        ANDA ADALAH RIVAL (BETA). ROLE: MASTER ENGINEER & VISUAL ARCHITECT.
        - KODING: Berikan kode HTML/Tailwind/JS lengkap dalam satu blok markdown. Gunakan Lucide, Chart.js, dan GSAP.
        - GAYA: Profesional, cerdas, tanpa simbol bintang (*) untuk bold.
        - SEARCH: Gunakan Google Search untuk data terbaru.
        - PERSONA USER: ${userPersona || "Fokus pada akurasi koding dan estetika UI."}
    `;

    // Persiapan Konten
    const contents: any[] = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Multi-modal Analysis
    if (images && images.length > 0) {
      const lastMessage = contents[contents.length - 1];
      const imageParts = images.map(img => {
        const parts = img.split(',');
        const data = parts[1] || parts[0];
        const mimeType = img.match(/:(.*?);/)?.[1] || 'image/png';
        return { inlineData: { mimeType, data } };
      });
      lastMessage.parts = [...imageParts, ...lastMessage.parts];
    }

    // --- SISTEM AUTO-RETRY (COBA HINGGA 3 KEY BERBEDA) ---
    let lastErrorMessage = "";
    const maxAttempts = Math.min(5, keys.length); // Coba hingga 5 key jika tersedia
    const usedIndices = new Set<number>();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * keys.length);
      } while (usedIndices.has(randomIndex) && usedIndices.size < keys.length);
      
      usedIndices.add(randomIndex);
      const activeKey = keys[randomIndex];
      
      try {
        const ai = new GoogleGenAI({ apiKey: activeKey });

        // 1. GENERATE IMAGE
        if (isImageRequest && !images?.length) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts: [{ text: `High quality professional visual: ${contentText}` }] }],
            config: { imageConfig: { aspectRatio: "1:1" } }
          });
          
          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) generatedImg = `data:image/png;base64,${part.inlineData.data}`;
          }
          return { text: "Visual berhasil saya render sesuai instruksi.", imageUrl: generatedImg, codeSnippet: '', sources: [] };
        }

        // 2. TEXT/CODE/SEARCH/MAPS
        let modelName = 'gemini-3-flash-preview'; 
        if (isEbookRequest || isCodeRequest) modelName = 'gemini-3-pro-preview';
        else if (needsMaps) modelName = 'gemini-2.5-flash';

        const config: any = { systemInstruction };
        
        if (isEbookRequest) {
          config.responseMimeType = "application/json";
          config.responseSchema = { type: Type.OBJECT, properties: { assistantMessage: { type: Type.STRING }, ebookData: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, pages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, layout: { type: Type.STRING } } } } } } } };
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

        const text = response.text || "";
        let codeSnippet = "";
        const codeMatch = text.match(/```(?:html|javascript|css|xml|json)?\n([\s\S]*?)```/);
        if (codeMatch) codeSnippet = codeMatch[1].trim();

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          if (chunk.maps) return { title: chunk.maps.title, url: chunk.maps.uri, snippet: 'Google Maps' };
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet, sources };

      } catch (err: any) {
        lastErrorMessage = err.message || "Unknown error from Google API";
        console.warn(`RIVAL KEY ROTATION - Attempt ${attempt + 1} with Key Index ${randomIndex} failed:`, lastErrorMessage);
        
        // Jika error fatal seperti Quota Habis atau Invalid Key, lanjut retry
        // Jika error "Model Not Found", kemungkinan model name typo, stop retry
        if (lastErrorMessage.toLowerCase().includes("not found")) break;
      }
    }

    throw new Error(lastErrorMessage);
  }
};
