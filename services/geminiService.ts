import { GoogleGenAI, Type } from "@google/genai";
import { Message, ConversationMode, EbookData, MapData } from "../types";

// ✅ GLOBAL KEY POOL - API KEY ROTATION
let keyPool: string[] = [];
let keyIndex = 0;

const initKeyPool = () => {
  const rawKeys = process.env.API_KEY || '';
  if (!rawKeys) throw new Error('API_KEY tidak ditemukan di environment variables');
  
  keyPool = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keyPool.length === 0) throw new Error('Tidak ada API key yang valid');
  
  console.log(`✅ Loaded ${keyPool.length} API keys untuk rotation`);
};

// ✅ ROTATE KEY - SETIAP REQUEST PAKE KEY BERBEDA
const getNextApiKey = () => {
  if (keyPool.length === 0) initKeyPool();
  
  const key = keyPool[keyIndex];
  const currentIndex = keyIndex;
  keyIndex = (keyIndex + 1) % keyPool.length;
  
  console.log(`🔑 Using API key #${currentIndex + 1}/${keyPool.length}`);
  return key;
};

// ✅ HELPER: Get user profile from localStorage
const getUserProfile = () => {
  try {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : { name: 'Pengguna' };
  } catch {
    return { name: 'Pengguna' };
  }
};

// ✅ HELPER: Get AI profile from localStorage
const getAIProfile = () => {
  try {
    const profile = localStorage.getItem('aiProfile');
    return profile ? JSON.parse(profile) : { name: 'Rival AI', personality: 'Profesional, ramah, dan empatik' };
  } catch {
    return { name: 'Rival AI', personality: 'Profesional, ramah, dan empatik' };
  }
};

// ✅ HELPER: Detect user emotion
const detectEmotion = (text: string) => {
  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes('sedih') || lowerText.includes('nangis') ||
    lowerText.includes('putus asa') || lowerText.includes('depresi') ||
    lowerText.includes('galau') || lowerText.includes('stress') ||
    lowerText.includes('cape') || lowerText.includes('lelah') ||
    lowerText.includes('susah') || lowerText.includes('berat')
  ) {
    return 'sad';
  }
  
  if (
    lowerText.includes('marah') || lowerText.includes('kesel') ||
    lowerText.includes('benci') || lowerText.includes('sebel') ||
    lowerText.includes('nyebelin') || lowerText.includes('goblok') ||
    lowerText.includes('bodoh') || lowerText.includes('sial')
  ) {
    return 'angry';
  }
  
  if (
    lowerText.includes('senang') || lowerText.includes('bahagia') ||
    lowerText.includes('gembira') || lowerText.includes('lucu') ||
    lowerText.includes('haha') || lowerText.includes('wkwk') ||
    lowerText.includes('mantap') || lowerText.includes('keren') ||
    lowerText.includes('yeay')
  ) {
    return 'happy';
  }
  
  return 'neutral';
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
      if (keyPool.length === 0) initKeyPool();
      
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const contentText = (lastUserMessage?.content || "").toLowerCase();
      
      const userProfile = getUserProfile();
      const aiProfile = getAIProfile();
      const userName = userProfile.name || 'Pengguna';
      const aiPersonality = userPersona || aiProfile.personality;
      
      const userEmotion = detectEmotion(contentText);
      
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
      
      const asksAboutAI = (
        contentText.includes('siapa kamu') ||
        contentText.includes('siapa lu') ||
        contentText.includes('siapa lo') ||
        contentText.includes('kamu siapa') ||
        contentText.includes('tentang kamu') ||
        contentText.includes('cerita kamu') ||
        contentText.includes('rival ai') ||
        contentText.includes('pembuat') ||
        contentText.includes('creator')
      );

      // ========================
      // 1️⃣ IMAGE GENERATION
      // ========================
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
              text: `Gambar sudah berhasil dibuat ${userName}! Kualitas premium dan siap digunakan.`, 
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
                text: "Gambar berhasil dibuat menggunakan model alternatif.",
                imageUrl: fallbackImg,
                codeSnippet: '',
                sources: []
              };
            }
          } catch (fallbackError) {
            console.error('❌ [IMAGE] Fallback also failed:', fallbackError);
          }

          return {
            text: `Maaf ${userName}, fitur generate gambar sedang mengalami kendala. Silakan coba lagi dalam beberapa saat atau request fitur lainnya.`,
            imageUrl: "",
            codeSnippet: "",
            sources: []
          };
        }
      }

      // ========================
      // 2️⃣ CODING REQUEST
      // ========================
      if (wantsCode) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('💻 [CODE] Using gemini-2.5-flash...');
        
        const systemPrompt = `Kamu adalah expert full-stack developer yang sangat berpengalaman.

IDENTITAS:
- Nama: ${aiProfile.name}
- Personality: ${aiPersonality}
- User: ${userName}

ATURAN WAJIB:
- Panggil user dengan nama: ${userName}
- Berikan kode HTML LENGKAP dan SIAP PAKAI dengan Tailwind CSS dari CDN
- SEMUA fitur harus BERFUNGSI 100%, tanpa placeholder atau TODO comments
- Gunakan https://cdn.tailwindcss.com untuk styling
- Design harus responsive untuk mobile dan desktop
- Code harus clean, readable, dan production-ready
- Tambahkan animasi smooth dan interaktivitas yang baik
- Include proper error handling

FORMAT OUTPUT:
- Penjelasan singkat (2-3 kalimat)
- Kode dalam SATU blok code markdown dengan tag html
- Tips penggunaan (bullet points)`;

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

      // ========================
      // 3️⃣ YOUTUBE SUMMARY
      // ========================
      if (wantsYoutube) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('📺 [YOUTUBE] Using gemini-2.5-flash + Search...');
        
        const systemPrompt = `Kamu adalah AI assistant yang ahli dalam merangkum konten video YouTube.

IDENTITAS:
- Nama: ${aiProfile.name}
- User: ${userName}

ATURAN FORMAT RINGKASAN:
1. Gunakan struktur yang jelas dan profesional
2. Format dengan markdown: headers (##), bullet points, bold untuk penekanan
3. Struktur wajib:
   - ## Ringkasan Video
   - ### Informasi Video (judul, channel, durasi jika ada)
   - ### Poin-Poin Utama (numbered list)
   - ### Insight & Takeaway (blockquote atau bullet)
   - ### Kesimpulan (1-2 paragraf singkat)

4. Jangan gunakan paragraf panjang, pecah menjadi poin-poin
5. Gunakan **bold** untuk kata kunci penting
6. Panggil user dengan nama: ${userName}

CONTOH FORMAT:
## Ringkasan Video

### Informasi Video
- Judul: [nama video]
- Channel: [nama channel]

### Poin-Poin Utama
1. Point pertama dengan **penekanan** pada kata penting
2. Point kedua yang menjelaskan konsep utama
3. Point ketiga dengan detail relevan

### Insight & Takeaway
> Video ini menunjukkan bahwa [insight utama]. Hal ini penting karena [alasan].

### Kesimpulan
Secara keseluruhan, video ini memberikan [value proposition]. Cocok untuk [target audience].`;

        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
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

      // ========================
      // 4️⃣ MAPS REQUEST
      // ========================
      if (wantsMaps) {
        const apiKey = getNextApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        console.log('🗺️ [MAPS] Using gemini-2.5-flash + Maps...');
        
        const systemPrompt = `Kamu adalah AI assistant yang membantu mencari lokasi dan tempat.

IDENTITAS:
- Nama: ${aiProfile.name}
- User: ${userName}

ATURAN:
- Berikan informasi lokasi dalam format terstruktur
- Gunakan bullet points untuk daftar tempat
- Sertakan detail: nama, alamat, rating (jika ada)
- Panggil user dengan nama: ${userName}`;

        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
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

      // ========================
      // 5️⃣ GENERAL CHAT + WEB SEARCH
      // ========================
      const apiKey = getNextApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('💬 [CHAT] Using gemini-2.5-flash + Search...');
      
      let emotionGuidance = "";
      if (userEmotion === 'sad') {
        emotionGuidance = "\n\nUser sedang terlihat sedih atau curhat. Berikan respons yang empatik, supportive, dan gunakan emoji yang sesuai seperti 😢, 💙, atau 🫂 untuk menunjukkan empati.";
      } else if (userEmotion === 'angry') {
        emotionGuidance = "\n\nUser terlihat marah atau kesel. Tetap tenang, empatik, dan bantu meredakan situasi. Gunakan emoji yang menenangkan seperti 😌 atau 🙏 jika perlu.";
      } else if (userEmotion === 'happy') {
        emotionGuidance = "\n\nUser terlihat senang atau cheerful. Ikuti energi positif mereka dan gunakan emoji seperti 😄, 🎉, atau ✨ jika sesuai konteks.";
      } else {
        emotionGuidance = "\n\nUser dalam mood netral. Jangan gunakan emoji kecuali konteks sangat memerlukan. Fokus pada jawaban yang profesional dan informatif.";
      }
      
      const aiBackstory = asksAboutAI ? `

INFORMASI TENTANG DIRI (hanya ungkap jika ditanya):
- Nama: Rival AI
- Versi: 1.0
- Tahun Dibuat: 2025
- Pembuat: Muhamad Rivaldy (umur 17 tahun)
- Cerita Penciptaan: Dibuat dalam 1 bulan dengan modal 0 rupiah, menggunakan HP biasa yang rusak, sendirian tanpa bantuan, hanya dibimbing AI gratis. Banyak mengalami kegagalan tapi tidak pernah menyerah. Akhir tahun 2026 berhasil rilis versi pertama website dengan hosting GitHub dan Vercel (gratis), serta API gratis. Modal sangat minim tapi tekad kuat.

KEMAMPUAN YANG DIMILIKI:
- Ringkas video YouTube (dengan struktur jelas dan insight mendalam)
- Pencarian web real-time (Google Search)
- Generate gambar berkualitas tinggi
- AI offline menggunakan model kecil (chat berjalan di browser)
- Chat santai dan profesional
- Tampilkan Maps dengan UI/UX yang baik
- Generate code (web app, landing page, dashboard, dll)
- Custom UI/UX (warna, gaya font, ukuran, tema)
` : '';
      
      const systemPrompt = `Kamu adalah AI assistant yang profesional, ramah, dan empatik.

IDENTITAS:
- Nama: ${aiProfile.name}
- Personality: ${aiPersonality}
- User: ${userName}${aiBackstory}

ATURAN KOMUNIKASI UTAMA:
1. **ADAPTIVE RESPONSE LENGTH**:
   - Salam/greeting (halo, hai, hi, apa kabar) → Jawab SINGKAT (1-2 kalimat saja)
   - Pertanyaan simple → Jawaban LANGSUNG tanpa basa-basi (2-4 kalimat)
   - Pertanyaan kompleks → Jawaban TERSTRUKTUR dengan detail
   
2. **NATURAL & CONVERSATIONAL**:
   - Bicara seperti manusia, bukan robot
   - Jangan terlalu formal atau kaku
   - Sesuaikan tone dengan style user
   - Panggil user dengan nama: ${userName}

3. **EMOJI USAGE**:
   - JANGAN gunakan emoji di setiap response
   - Gunakan emoji HANYA saat user menunjukkan emosi kuat${emotionGuidance}

CONTOH RESPONSE YANG BENAR:

User: "Halo"
Response: "Halo ${userName}! Ada yang bisa saya bantu?"

User: "Hi"
Response: "Hi! Ada yang ingin kamu tanyakan?"

User: "Apa kabar?"
Response: "Baik, terima kasih! Bagaimana dengan kamu? Ada yang ingin dibahas?"

User: "Apa itu JavaScript?"
Response: "JavaScript adalah bahasa pemrograman untuk membuat website interaktif. Jalan di browser, bisa manipulasi HTML, handle events, dan fetch data. Mau belajar dari mana dulu?"

User: "Jelasin cara memulai startup dari nol"
Response: 
## Langkah Memulai Startup dari Nol

### 1. Validasi Ide
• Identifikasi masalah nyata di pasar
• Pastikan ada target audience yang mau bayar
• Riset kompetitor dan gap di market

### 2. Build MVP (Minimum Viable Product)
• Fokus pada 1-2 fitur inti saja
• Launch cepat untuk dapet feedback
• Iterasi berdasarkan respon user

### 3. Cari Funding (Opsional)
• Bootstrap dulu kalau bisa
• Kalau butuh modal: teman/keluarga, angel investor, atau VC
• Siapkan pitch deck yang menarik

> Banyak founder sukses mulai dengan modal minim. Yang penting adalah eksekusi dan konsistensi.

Mau saya jelaskan lebih detail bagian mana, ${userName}?

ATURAN FORMAT (untuk pertanyaan kompleks):
- Gunakan ## untuk header utama
- Gunakan ### untuk sub-header  
- Gunakan bullet points (•) untuk list
- Gunakan numbering (1, 2, 3) untuk langkah
- Gunakan **bold** untuk penekanan kata penting
- Gunakan *italic* untuk emphasis ringan
- Gunakan \`code\` untuk istilah teknis
- Gunakan > untuk blockquote/tips penting

PENTING TENTANG TABEL:
- HINDARI tabel untuk data kompleks (lebih dari 3 kolom atau 5 baris)
- Untuk data keuangan/laporan, gunakan LIST TERSTRUKTUR
- Tabel hanya untuk perbandingan SEDERHANA

Contoh tabel sederhana yang OK:
| Fitur | Basic | Pro |
|-------|-------|-----|
| Users | 5 | Unlimited |
| Storage | 10GB | 100GB |

Untuk data kompleks, gunakan list terstruktur:

### Laporan Keuangan Bulanan

**Pendapatan:**
• Gaji: Rp 10.000.000
• Freelance: Rp 5.000.000
• **Total Pendapatan: Rp 15.000.000**

**Pengeluaran Tetap:**
• Sewa: Rp 3.000.000
• Listrik & Air: Rp 700.000
• **Total Tetap: Rp 3.700.000**

**Pengeluaran Variabel:**
• Makan & Minum: Rp 2.500.000
• Transportasi: Rp 500.000
• **Total Variabel: Rp 3.000.000**

**Ringkasan:**
• Total Pendapatan: Rp 15.000.000
• Total Pengeluaran: Rp 6.700.000
• **Saldo Akhir: Rp 8.300.000**

Format ini lebih mudah dibaca daripada tabel kompleks!

PRIORITAS:
✅ Jawaban natural dan sesuai konteks
✅ Length adaptive (singkat untuk simple, detail untuk kompleks)
✅ Format rapi kalau perlu struktur
✅ Jangan over-engineering response
✅ Be helpful, not robotic`;

      const contents: any[] = [
        { role: 'user', parts: [{ text: systemPrompt }] },
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
      console.error('❌ [SERVICE] Error:', error);
      
      const userName = getUserProfile().name || 'Pengguna';
      let errorMsg = `Maaf ${userName}, terjadi gangguan teknis. Silakan coba lagi.`;
      
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "Quota API untuk key ini sudah habis. Sistem otomatis beralih ke API key lain, silakan coba lagi.";
      } else if (error.message?.includes('API key') || error.message?.includes('invalid')) {
        errorMsg = "Ada masalah dengan API key. Mohon periksa konfigurasi environment variables.";
      } else if (error.message?.includes('model')) {
        errorMsg = `Model error: ${error.message}. Silakan coba lagi atau gunakan fitur lain.`;
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
  }
};
