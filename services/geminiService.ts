import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

/**
 * RIVAL MULTI-CORE ROTATION SYSTEM
 * Supports 1 to 50+ API Keys separated by comma in environment variable
 */
const getApiKey = (): string => {
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
    try {
      const apiKey = getApiKey();
      
      if (!apiKey) {
        throw new Error('API_KEY tidak ditemukan di environment variables');
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const contentText = (lastUserMessage?.content || "").toLowerCase();

      // Intent Detection
      const isImageRequest = contentText.match(/(gambar|lukis|draw|generate image|bikin foto|buatkan gambar|image|visualize)/i);
      const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);
      const isEbookRequest = contentText.match(/\b(ebook|presentasi|slide|deck|buku digital)\b/i) &&
        contentText.match(/\b(buat|bikin|buatkan|generate|susun)\b/i);

      // System Instruction
      const systemInstruction = `
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

      // Model Selection
      let modelName = 'gemini-1.5-flash';
      if (isEbookRequest || isCodeRequest) {
        modelName = 'gemini-1.5-pro';
      }

      // Get Model
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
      });

      // Build History (exclude last message for sendMessage)
      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Start Chat
      const chat = model.startChat({
        history: history,
      });

      // Get last user message
      const lastMessage = messages[messages.length - 1];
      let messageParts: any[] = [{ text: lastMessage.content }];

      // Add images if present
      if (images && images.length > 0) {
        const imageParts = images.map(img => {
          const [header, data] = img.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          return {
            inlineData: {
              mimeType,
              data
            }
          };
        });
        messageParts = [...imageParts, ...messageParts];
      }

      // Send Message
      const result = await chat.sendMessage(messageParts);
      const response = result.response;
      let text = response.text();

      // Extract code snippets
      let codeSnippet = "";
      const codeMatch = text.match(/```(?:html|javascript|css|typescript|xml)?\n([\s\S]*?)```/);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
      }

      return {
        text,
        imageUrl: "",
        codeSnippet,
        sources: [],
        ebookData: undefined,
        mapData: undefined
      };

    } catch (error: any) {
      console.error('Gemini Service Error:', error);
      
      // Error Handling
      if (error.message?.includes('API_KEY')) {
        throw new Error('API Key tidak valid atau tidak ditemukan');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('API quota habis. Coba lagi nanti.');
      }

      if (error.message?.includes('rate limit')) {
        throw new Error('Terlalu banyak request. Tunggu sebentar.');
      }

      throw new Error(`Rival error: ${error.message}`);
    }
  }
};
