import { GoogleGenAI } from "@google/genai";
import { Message, ConversationMode } from "../types";

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
    
    const isCodeRequest = contentText.match(/(koding|coding|buatkan aplikasi|bikin web|app|script|program|javascript|html|website|dashboard)/i);

    let systemInstruction = `ANDA ADALAH RIVAL (BETA). MASTER ENGINEER & VISUAL ARCHITECT. Profesional, tegas, cerdas. ${userPersona || "Fokus efisiensi."}`;

    let modelName = 'gemini-1.5-flash';
    if (isCodeRequest) {
      modelName = 'gemini-1.5-pro';
    }

    const contents = messages.map(m => ({
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

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: { systemInstruction }
    });

    let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    let codeSnippet = "";
    const codeMatch = text.match(/```(?:html|javascript|css|typescript|xml)?\n([\s\S]*?)```/);
    if (codeMatch) {
      codeSnippet = codeMatch[1].trim();
    }

    return { text, imageUrl: "", codeSnippet, sources: [] };
  }
};
