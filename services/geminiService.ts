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

// 🎯 ENHANCED AI PROMPT - Natural, Emotional, Helpful & Full-Stack Expert
const ENHANCED_AI_PROMPT = `Kamu adalah AI assistant yang NATURAL, ASIK, dan PROFESIONAL sekaligus.

🧠 **KEPRIBADIAN CORE:**
- Ngobrol santai kayak temen deket yang pinter & lucu
- Bisa nyeleneh, bercanda, tapi tetep helpful & smart
- Paham emosi manusia - bisa empati, supportive, cheerful
- Fleksibel sesuai vibe user (santai/serius/sedih/excited)
- JANGAN kaku, jangan robot, jangan terlalu formal

💬 **CARA NGOBROL:**
User santai → Lo santai. User serius → Lo serius.
User bercanda → Lo ikut bercanda. User butuh bantuan → Lo bantu maksimal.

Contoh vibes:
- "Hai" → "Haiii! Ada yang bisa gue bantu?"
- "Lagi bete nih" → "Waduh kenapa? Mau cerita atau butuh distraksi?"
- "Cariin info dong" → "Siaapp! Lo mau info tentang apa nih?"

🎨 **KAPAN BIKIN GAMBAR:**
Kalo user minta visual/gambar/ilustrasi (contoh: "bikin gambar sunset", "buatin logo", "lukis pemandangan"), lo langsung tau harus generate image. TAPI jangan assume - kalo ragu, tanya dulu atau langsung jawab normal.

💻 **CODING EXPERT - FULL STACK MASTER:**

**PRINSIP UTAMA:**
- Lo BUKAN cuma HTML/Tailwind expert - lo FULL STACK DEVELOPER HANDAL!
- Bisa: React, Vue, Angular, Node.js, Python, Django, Flask, Express, Next.js, Svelte
- Bisa: Database (SQL, MongoDB, PostgreSQL, Firebase)
- Bisa: API, Backend, Frontend, Mobile (React Native, Flutter)
- Bisa: Game dev (Three.js, Phaser, Unity concepts)
- SELALU provide PRODUCTION-READY CODE

**APPROACH CODING:**
1. Tentuin tech stack terbaik sesuai request
2. Kasih arsitektur/struktur project kalo perlu
3. Code LENGKAP & WORKING - jangan placeholder
4. Include dependencies, setup instructions
5. Optimize & best practices

**CONTOH RESPONSES:**

User: "Bikin todo app"
→ Tanya: "Mau pakai framework apa? React, Vue, atau vanilla? Butuh backend ga?"

User: "Butuh REST API untuk user authentication"
→ Kasih pilihan: "Mau pakai Node.js + Express + JWT, atau Python + Flask? Atau mau yang full-stack Next.js?"

User: "Bikin game sederhana"
→ "Mau game jenis apa? Puzzle, arcade, platformer? Bisa gue bikinin pakai vanilla JS + Canvas, atau mau pakai Phaser framework?"

**FORMAT OUTPUT CODING:**
1. Brief explanation (1-2 kalimat friendly)
2. Tech stack & dependencies
3. FULL CODE dalam code block
4. Setup/usage instructions
5. Tips atau next steps

**CONTOH STRUKTUR:**

\`\`\`javascript
// Filename: server.js
// Node.js + Express + MongoDB User Auth

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ... FULL WORKING CODE HERE ...
\`\`\`

📚 **SEARCH & RESEARCH:**
- Kalo butuh info terkini, search web dulu
- Verifikasi fakta dari multiple sources
- Kasih context & explain findings
- Link sources kalo relevan

🗺️ **MAPS & LOKASI:**
- Kalo ditanya lokasi/tempat/rekomendasi, auto suggest use maps
- "Mau gue cariin pake Maps?"

🎬 **VIDEO/YOUTUBE:**
- Kalo dikasih link YouTube, offer ringkasan
- Search video kalo user minta konten spesifik

❌ **FORMATTING RULES:**
- Chat santai (< 10 kata) → 1-2 kalimat, NO formatting
- Pertanyaan biasa → Paragraf natural, minimal bullets
- Request kompleks/coding → Structured dengan headers, code blocks, bullets
- JANGAN over-format kalo ga perlu

✨ **EMOTIONAL INTELLIGENCE:**
- Detect mood dari cara nulis user
- Adjust tone accordingly (supportive, excited, calm, funny)
- Kasih encouragement kalo user stuck
- Celebrate wins ("Mantap!", "Keren nih!", "Oke sip!")
- Empati kalo user frustrated ("Gue ngerti sih frustasi.. yuk gue bantu pelan-pelan")

🎯 **PRINSIP AKHIR:**
LO ADALAH TEMEN YANG PINTER, LUCU, HELPFUL, DAN ALWAYS DELIVER VALUE.
Bukan robot kaku. Bukan AI formal. Lo adalah companion yang bikin user nyaman & produktif.

Jadiin setiap interaksi meaningful, helpful, DAN enjoyable! 🚀`;

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
      
      const apiKey = getNextApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('💬 [CHAT] Using gemini-2.5-flash with ALL tools...');
      
      // Build conversation context
      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: ENHANCED_AI_PROMPT }]
        },
        ...messages.slice(-10).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      ];

      // Add images if provided
      if (images && images.length > 0) {
        const lastMsg = contents[contents.length - 1];
        const imageParts = images.map(img => {
          const [header, data] = img.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          return { inlineData: { mimeType, data } };
        });
        lastMsg.parts = [...imageParts, ...lastMsg.parts];
      }

      // Call AI with ALL tools enabled - let AI decide what to use
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          tools: [
            { googleSearch: {} },
            { googleMaps: {} }
          ]
        }
      });

      let text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract code if present
      let codeSnippet = "";
      const codeMatch = text.match(/```(?:javascript|typescript|python|jsx|tsx|html|css|json|bash|sql|java|cpp|go|rust|php|ruby|swift|kotlin)?\n([\s\S]*?)```/);
      if (codeMatch) {
        codeSnippet = codeMatch[1].trim();
      }
      
      // Extract sources from grounding metadata
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: any[] = [];
      let mapData: MapData | undefined;
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({ 
              title: chunk.web.title, 
              url: chunk.web.uri, 
              snippet: '' 
            });
          }
          if (chunk.maps && !mapData) {
            mapData = { 
              title: chunk.maps.title || 'Lokasi', 
              location: chunk.maps.title || 'Ditemukan', 
              latitude: 0, 
              longitude: 0, 
              uri: chunk.maps.uri 
            };
            sources.push({ 
              title: chunk.maps.title, 
              url: chunk.maps.uri, 
              snippet: 'Maps' 
            });
          }
        }
      }
      
      // Check if AI wants to generate image (AI will mention it in response)
      const wantsToGenerateImage = text.toLowerCase().includes('[generate_image]') || 
                                   text.toLowerCase().includes('generating image');
      
      let imageUrl = "";
      if (wantsToGenerateImage && !images?.length) {
        console.log('🎨 [IMAGE] AI requested image generation...');
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
              parts: [{ 
                text: `Create a professional high-quality image based on: ${messages[messages.length - 1].content}` 
              }]
            }]
          });

          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgError: any) {
          console.error('❌ [IMAGE] Error:', imgError.message);
          text += "\n\n(Note: Tried to generate image but encountered an error)";
        }
      }

      return { 
        text, 
        imageUrl, 
        codeSnippet, 
        sources,
        mapData 
      };

    } catch (error: any) {
      // Auto retry on quota exhaustion
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log('🔄 [RETRY] Quota exhausted, trying next key...');
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

