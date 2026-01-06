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
      // MODEL BARU: Qwen2.5-0.5B-Instruct (~297MB)
      // Lebih ringan, lebih pintar, lebih natural dari Qwen1.5
      const pipe = await pipeline('text-generation', 'Xenova/Qwen2.5-0.5B-Instruct', {
        progress_callback: (data: any) => {
          if (this.cancelFlag) {
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

    // Format prompt Qwen2.5 Instruct (lebih natural)
    const systemPrompt = "Kamu adalah Rival, asisten AI pintar yang berjalan 100% OFFLINE di perangkat ini. Jawab dengan singkat, jelas, dan membantu.";
    
    // Build conversation history (batasi 4 pesan terakhir untuk performa)
    let conversation = `<|im_start|>system\n${systemPrompt}<|im_end|>\n`;
    
    const recentHistory = history.slice(-4);
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      conversation += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
    }
    
    conversation += `<|im_start|>user\n${input}<|im_end|>\n<|im_start|>assistant\n`;

    try {
      const output = await this.generator(conversation, {
        max_new_tokens: 300,
        temperature: 0.7,
        do_sample: true,
        top_k: 40,
        top_p: 0.9,
        repetition_penalty: 1.1,
        stop: ['<|im_end|>', '<|im_start|>'],
      });

      let responseText = output[0].generated_text;
      
      // Extract assistant response
      const parts = responseText.split('<|im_start|>assistant\n');
      if (parts.length > 1) {
        responseText = parts[parts.length - 1].split('<|im_end|>')[0].trim();
      } else {
        responseText = responseText.trim();
      }

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
