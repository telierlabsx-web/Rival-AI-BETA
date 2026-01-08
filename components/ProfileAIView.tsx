import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';

interface ProfileAIViewProps {
  state: UserProfile;
  onUpdateState: (updated: UserProfile) => void;
  onBack: () => void;
  onAvatarClick: () => void;
}

export const ProfileAIView: React.FC<ProfileAIViewProps> = ({ 
  state, 
  onUpdateState, 
  onBack,
  onAvatarClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setIsUploading(true);

    try {
      // Convert ke base64 untuk preview & simpan
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update avatar AI
        onUpdateState({ 
          ...state, 
          aiAvatar: base64String 
        });
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal upload foto!');
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handler untuk save perubahan
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validasi
      if (!state.aiName.trim()) {
        alert('Nama sistem tidak boleh kosong!');
        setIsSaving(false);
        return;
      }

      // Simpan ke localStorage (sudah auto-save via onUpdateState, tapi kita trigger lagi buat mastiin)
      localStorage.setItem('rival_profile', JSON.stringify(state));
      
      // Bisa juga kirim ke backend kalau ada:
      // await fetch('/api/save-ai-profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     aiName: state.aiName,
      //     aiPersona: state.aiPersona,
      //     aiAvatar: state.aiAvatar
      //   })
      // });

      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan perubahan!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-400 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-black text-sm uppercase tracking-wide">Identitas Rival Tersimpan!</span>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col gap-6">
          <div className="relative group w-32 h-32 cursor-pointer" onClick={handleAvatarClick}>
            <img 
              src={state.aiAvatar} 
              className="w-full h-full rounded-[2.5rem] object-cover border border-current/10 shadow-2xl transition-transform group-hover:scale-[1.02]" 
              alt="AI" 
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-[2.5rem] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button 
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-left opacity-30 hover:opacity-100 transition-opacity disabled:opacity-20"
          >
            {isUploading ? 'MENGUPLOAD...' : 'UNGGAH FOTO RIVAL BARU'}
          </button>
        </div>
        
        <div className="space-y-10 mt-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 block">NAMA SISTEM</label>
            <input 
              type="text" 
              value={state.aiName}
              onChange={(e) => onUpdateState({ ...state, aiName: e.target.value })}
              className="w-full bg-current/[0.02] border border-current/5 py-5 px-8 rounded-[1.5rem] focus:outline-none text-base font-black tracking-tight focus:border-current/20 transition-all shadow-sm" 
              placeholder="Masukkan nama AI..."
            />
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 block">PERSONA & INSTRUKSI</label>
            <textarea 
              rows={10}
              value={state.aiPersona}
              onChange={(e) => onUpdateState({ ...state, aiPersona: e.target.value })}
              placeholder="Tuliskan bagaimana Rival harus bersikap..."
              className="w-full bg-current/[0.02] p-8 rounded-[2.5rem] border border-current/5 focus:outline-none text-sm font-medium leading-relaxed focus:border-current/20 transition-all shadow-sm resize-none" 
            />
          </div>

          {/* Tombol Simpan */}
          <button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="w-full py-5 px-8 bg-black text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                MENYIMPAN...
              </span>
            ) : (
              'SIMPAN PERUBAHAN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

