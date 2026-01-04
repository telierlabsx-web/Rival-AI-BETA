
import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

/**
 * RIVAL SMART ROTATION & RETRY SYSTEM
 * Mengambil daftar key dan membersihkan whitespace/karakter ilegal.
 */
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
    
    // Identifikasi Kebutuhan
    const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize)/i);
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);
    const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) && 
                          contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);
    const needsMaps = contentText.match(/(dimana|tempat|restoran|wisata|hotel|lokasi|dekat|maps|tunjukkan)/i);

    // Hardcoded Intelligence Core
    const systemInstruction = `
        ANDA ADALAH RIVAL (BETA). ROLE: MASTER ENGINEER & VISUAL ARCHITECT.
        - KODING: Berikan kode HTML/Tailwind/JS lengkap dalam satu blok markdown.
        - GAYA: Profesional, cerdas, tanpa simbol bintang (*) untuk bold.
        - FITUR: Mampu gambar, cari web, dan navigasi maps.
        - PERSONA USER: ${userPersona || "Bersikaplah sangat efisien."}
    `;

    // Pilih Model
    let modelName = 'gemini-3-flash-preview'; 
    if (isEbookRequest || isCodeRequest) modelName = 'gemini-3-pro-preview';
    else if (needsMaps) modelName = 'gemini-2.5-flash';

    // Persiapan Konten
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

    // --- SISTEM AUTO-RETRY (COBA HINGGA 3 KEY BERBEDA) ---
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

        // Spesifik untuk Generate Gambar
        if (isImageRequest && !images?.length) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts: [{ text: `Create visual for: ${contentText}` }] }]
          });
          
          let generatedImg = "";
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) generatedImg = `data:image/png;base64,${part.inlineData.data}`;
          }
          return { text: "Visual diproses.", imageUrl: generatedImg, codeSnippet: '', sources: [] };
        }

        // Request Standar (Text/Code/Search)
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

        // Jika sampai sini, artinya BERHASIL
        let text = response.text || "";
        let codeSnippet = "";
        let codeMatch = text.match(/```(?:html|javascript|css)?\n([\s\S]*?)```/);
        if (codeMatch) codeSnippet = codeMatch[1].trim();

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, url: chunk.web.uri, snippet: '' };
          return null;
        }).filter(Boolean) || [];

        return { text, imageUrl: "", codeSnippet, sources };

      } catch (err: any) {
        lastErrorMessage = err.message || "Unknown Error";
        console.warn(`Attempt ${attempt + 1} failed with Key Index ${randomIndex}:`, lastErrorMessage);
        
        // Jika errornya adalah "Model Not Found", jangan retry pake key lain karena masalahnya di nama model
        if (lastErrorMessage.includes("not found")) break;
        
        // Lanjut ke loop berikutnya (coba key lain)
      }
    }

    // Jika semua attempt gagal
    console.error("Rival Multi-Core Failure:", lastErrorMessage);
    throw new Error(`Rival Error: ${lastErrorMessage}`);
  }
};
