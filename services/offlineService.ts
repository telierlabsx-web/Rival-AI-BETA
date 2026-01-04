
import { pipeline, env } from '@xenova/transformers';
import { Message } from "../types";

// Konfigurasi Transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

class OfflineEngine {
  private generator: any = null;
  private isInitializing = false;
  private cancelFlag = false;

  async init(onProgress?: (progress: number) => void) {
    if (this.generator) return;
    this.isInitializing = true;
    this.cancelFlag = false;

    try {
      // Menggunakan Qwen-1.5B-Chat quantized yang sangat efisien
      const pipe = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
        progress_callback: (data: any) => {
          if (this.cancelFlag) {
            // Kita tidak bisa benar-benar menghentikan fetch internal pipeline, 
            // tapi kita mengabaikan progresnya jika dibatalkan.
            return;
          }
          if (data.status === 'progress' && onProgress) {
            onProgress(data.progress);
          }
        }
      });

      if (this.cancelFlag) {
        this.isInitializing = false;
        return;
      }

      this.generator = pipe;
    } catch (err) {
      console.error("Gagal inisialisasi model offline:", err);
      this.isInitializing = false;
      throw err;
    }
    this.isInitializing = false;
  }

  cancelInit() {
    this.cancelFlag = true;
    this.isInitializing = false;
  }

  async chat(input: string, history: Message[]) {
    if (!this.generator) {
      return "Model offline belum siap. Silakan unduh atau tunggu sebentar.";
    }

    // Format prompt Qwen Chat
    const systemPrompt = "You are Rival, a high-intelligence AI assistant running 100% OFFLINE on this device. Be concise and helpful.";
    let prompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n`;
    
    // Tambahkan sedikit konteks history jika perlu (batasi agar tidak lambat)
    const context = history.slice(-3).map(m => 
      `<|im_start|>${m.role === 'user' ? 'user' : 'assistant'}\n${m.content}<|im_end|>`
    ).join('\n');
    
    prompt += `${context}\n<|im_start|>user\n${input}<|im_end|>\n<|im_start|>assistant\n`;

    try {
      const output = await this.generator(prompt, {
        max_new_tokens: 256,
        temperature: 0.7,
        do_sample: true,
        top_k: 50,
        stop: ['<|im_end|>', '<|im_start|>'],
      });

      let responseText = output[0].generated_text;
      const parts = responseText.split('<|im_start|>assistant\n');
      responseText = parts[parts.length - 1].split('<|im_end|>')[0].trim();

      return responseText || "Maaf, Rival tidak bisa memberikan jawaban saat ini.";
    } catch (err) {
      console.error("Inference error:", err);
      return "Terjadi kesalahan pada mesin AI lokal. Silakan coba lagi.";
    }
  }

  isReady() {
    return !!this.generator;
  }

  isWorking() {
    return this.isInitializing;
  }
}

export const offlineService = new OfflineEngine();
