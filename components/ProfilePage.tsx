import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { SubscriptionCard } from './SubscriptionCard';
import { SubHeader } from './SubHeader';
import { ProfileAIView } from './ProfileAIView';
import { offlineService } from '../services/offlineService';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onBack: () => void;
  onClearData: () => void;
  onLogout: () => void;
}

type SubPage = 'main' | 'layanan' | 'identitas' | 'tema' | 'tipografi' | 'profil' | 'keamanan' | 'offline';

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  profile, 
  onUpdateProfile, 
  onBack, 
  onClearData, 
  onLogout 
}) => {
  const [activeSubPage, setActiveSubPage] = useState<SubPage>('main');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploadingUserPhoto, setIsUploadingUserPhoto] = useState(false);
  const [isSavingUserProfile, setIsSavingUserProfile] = useState(false);
  const [showUserToast, setShowUserToast] = useState(false);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);
  
  const isDark = profile.theme === 'black' || profile.theme === 'slate';

  const fonts = [
    { id: 'inter', name: 'Inter Sans', class: 'font-inter' },
    { id: 'serif', name: 'Playfair Serif', class: 'font-serif' },
    { id: 'mono', name: 'JetBrains Mono', class: 'font-mono' },
    { id: 'modern', name: 'Outfit Modern', class: 'font-modern' },
    { id: 'classic', name: 'Montserrat Classic', class: 'font-classic' },
    { id: 'tech', name: 'Space Tech', class: 'font-tech' },
    { id: 'readable', name: 'Lexend Readable', class: 'font-readable' },
    { id: 'elegant', name: 'Jakarta Elegant', class: 'font-elegant' },
  ];

  const startDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await offlineService.init((p) => setDownloadProgress(p));
      if (!offlineService.isWorking() && offlineService.isReady()) {
        onUpdateProfile({ ...profile, offlineModelDownloaded: true });
        setIsDownloading(false);
      }
    } catch (err) {
      setIsDownloading(false);
      alert("Gagal mengunduh model AI. Cek koneksi internet.");
    }
  };

  const cancelDownload = () => {
    offlineService.cancelInit();
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  // Handler untuk upload foto user
  const handleUserPhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setIsUploadingUserPhoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ ...profile, avatar: base64String });
        setIsUploadingUserPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal upload foto!');
      setIsUploadingUserPhoto(false);
    }
  };

  // Handler untuk save profil user
  const handleSaveUserProfile = async () => {
    setIsSavingUserProfile(true);
    
    try {
      // Validasi
      if (!profile.name.trim()) {
        alert('Nama tidak boleh kosong!');
        setIsSavingUserProfile(false);
        return;
      }

      // Simpan ke localStorage
      localStorage.setItem('rival_profile', JSON.stringify(profile));
      
      // Bisa juga kirim ke backend kalau ada:
      // await fetch('/api/save-user-profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: profile.name,
      //     avatar: profile.avatar
      //   })
      // });

      // Show success toast
      setShowUserToast(true);
      setTimeout(() => setShowUserToast(false), 3000);
      
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan perubahan!');
    } finally {
      setIsSavingUserProfile(false);
    }
  };

  const renderContent = () => {
    switch (activeSubPage) {
      case 'offline':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <SubHeader title="Rival Offline Core" onBack={() => setActiveSubPage('main')} />
            <div className="p-10 rounded-[2.5rem] border border-current/10 bg-current/[0.02] space-y-8">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 </div>
                 <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">AI Lokal v1.0 (Qwen-0.5B)</h4>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Ukuran Paket: ~450 MB</p>
                 </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium opacity-60">Chat Tanpa Internet (Real Local Inference)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium opacity-60">100% Privasi (Semua Data di Perangkat)</span>
                  </div>
               </div>

               {profile.offlineModelDownloaded ? (
                 <div className="space-y-4 pt-4">
                    <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 text-center text-[10px] font-black uppercase tracking-widest">
                      CORE SIAP & TERINSTAL DI STORAGE
                    </div>
                    <button 
                      onClick={() => onUpdateProfile({ ...profile, offlineModelDownloaded: false, isOfflineMode: false })}
                      className="w-full py-4 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      Hapus Model & Bersihkan Cache
                    </button>
                 </div>
               ) : (
                 <div className="pt-4">
                   {isDownloading ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="w-full h-2 bg-current/5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">{Math.round(downloadProgress)}% UNDUH SELESAI</p>
                        </div>
                        <button 
                          onClick={cancelDownload}
                          className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all"
                        >
                          Batalkan Pengunduhan
                        </button>
                     </div>
                   ) : (
                    <button 
                      onClick={startDownload}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                      Unduh Paket Offline Sekarang
                    </button>
                   )}
                 </div>
               )}
            </div>
          </div>
        );
      case 'layanan':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <SubHeader title="Layanan Rival" onBack={() => setActiveSubPage('main')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              <SubscriptionCard 
                tier="free"
                price="Gratis Selamanya"
                title="Dasar"
                description="Cocok untuk eksplorasi awal dengan Rival AI."
                benefits={["5 Visual Gen / hari", "Chat Grounding", "Standard Intelligence"]}
                buttonText="Sudah Aktif"
                onSubscribe={() => {}}
                isDark={isDark}
              />
              <SubscriptionCard 
                tier="pro"
                price="Rp 99k / bulan"
                title="Pro Analyst"
                description="Untuk pengguna yang membutuhkan efisiensi tinggi."
                benefits={["100 Visual Gen / hari", "Search Grounding Pro", "High Intelligence (Flash)", "Unlimited Chat"]}
                buttonText="Upgrade ke Pro"
                isPopular={true}
                onSubscribe={() => onUpdateProfile({...profile, isSubscribed: true})}
                isDark={isDark}
              />
              <SubscriptionCard 
                tier="ultimate"
                price="Rp 249k / bulan"
                title="Ultimate Dev"
                description="Akses penuh ke semua model tercanggih."
                benefits={["Unlimited Visual Gen", "Maps Grounding", "Advanced Reasoning (Pro)", "Live Code Studio"]}
                buttonText="Beli Ultimate"
                onSubscribe={() => onUpdateProfile({...profile, isSubscribed: true})}
                isDark={isDark}
              />
            </div>
          </div>
        );
      case 'identitas':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <SubHeader title="Identitas Rival" onBack={() => setActiveSubPage('main')} />
            <ProfileAIView 
              state={profile} 
              onUpdateState={onUpdateProfile} 
              onBack={() => setActiveSubPage('main')} 
              onAvatarClick={() => {}} 
            />
          </div>
        );
      case 'tema':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <SubHeader title="Tema & Visual" onBack={() => setActiveSubPage('main')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['white', 'black', 'cream', 'slate'].map((t: any) => (
                <button
                  key={t}
                  onClick={() => onUpdateProfile({ ...profile, theme: t })}
                  className={`group relative p-8 rounded-[2rem] border transition-all overflow-hidden ${profile.theme === t ? 'border-current' : 'border-current/10 opacity-60 hover:opacity-100'}`}
                >
                  <div className={`absolute inset-0 opacity-10 theme-${t}`} />
                  <span className="relative text-xs font-black uppercase tracking-[0.2em]">{t} Theme</span>
                  {profile.theme === t && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-current rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 'tipografi':
        return (
          <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            <SubHeader title="Tipografi & Skala" onBack={() => setActiveSubPage('main')} />
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Pilihan Gaya Font</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateProfile({ ...profile, font: f.id as any })}
                    className={`w-full p-6 rounded-[2rem] border text-left transition-all ${profile.font === f.id ? 'border-current bg-current/[0.03]' : 'border-current/10 opacity-40 hover:opacity-100'}`}
                  >
                    <div className={`text-xl ${f.class} mb-1 truncate`}>Rival Intelligence</div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-12 bg-current/[0.02] p-10 rounded-[3rem] border border-current/5">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Ukuran Teks</label>
                  <span className="text-xs font-black uppercase tracking-widest">{profile.fontSize || 100}%</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black opacity-30">A</span>
                  <input type="range" min="80" max="140" step="5" value={profile.fontSize || 100} onChange={(e) => onUpdateProfile({ ...profile, fontSize: parseInt(e.target.value) })} className="flex-1 accent-current" />
                  <span className="text-lg font-black opacity-30">A</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Skala Antarmuka (UI/UX)</label>
                  <span className="text-xs font-black uppercase tracking-widest">{Math.round((profile.uiScale || 1) * 100)}%</span>
                </div>
                <div className="flex items-center gap-6">
                  <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                  <input type="range" min="0.8" max="1.2" step="0.05" value={profile.uiScale || 1} onChange={(e) => onUpdateProfile({ ...profile, uiScale: parseFloat(e.target.value) })} className="flex-1 accent-current" />
                  <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300 relative">
            {/* Toast Notification untuk User Profile */}
            {showUserToast && (
              <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-black text-sm uppercase tracking-wide">Profil Tersimpan!</span>
                </div>
              </div>
            )}

            <SubHeader title="Profil Pengguna" onBack={() => setActiveSubPage('main')} />
            <div className="space-y-10">
              <div className="flex flex-col gap-6">
                <div 
                  className="relative w-32 h-32 cursor-pointer group"
                  onClick={() => userPhotoInputRef.current?.click()}
                >
                  <img 
                    src={profile.avatar} 
                    className="w-full h-full rounded-[2.5rem] object-cover border border-current/10 shadow-2xl transition-transform group-hover:scale-[1.02]" 
                    alt="User" 
                  />
                  {isUploadingUserPhoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-[2.5rem] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <input
                  ref={userPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUserPhotoSelect}
                  className="hidden"
                />
                
                <button 
                  onClick={() => userPhotoInputRef.current?.click()}
                  disabled={isUploadingUserPhoto}
                  className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all text-left disabled:opacity-20"
                >
                  {isUploadingUserPhoto ? 'MENGUPLOAD...' : 'GANTI FOTO PROFIL'}
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">NAMA TAMPILAN</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })} 
                    className="w-full bg-current/[0.03] border border-current/10 py-4 px-6 rounded-2xl focus:outline-none text-base font-black focus:border-current/20 transition-all" 
                    placeholder="Masukkan nama Anda..."
                  />
                </div>

                {/* Tombol Simpan untuk User Profile */}
                <button
                  onClick={handleSaveUserProfile}
                  disabled={isSavingUserProfile || isUploadingUserPhoto}
                  className="w-full py-5 px-8 bg-black text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSavingUserProfile ? (
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
      case 'keamanan':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <SubHeader title="Keamanan & Privasi" onBack={() => setActiveSubPage('main')} />
            <div className="space-y-6">
               <div className="p-10 rounded-[2.5rem] border border-current/10 bg-current/[0.02] space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-tight">Manajemen Data Lokal</h4>
                 <p className="text-xs opacity-50 leading-relaxed">Seluruh percakapan dan aset Anda disimpan secara lokal di browser ini. Menghapus data akan menghilangkan seluruh riwayat secara permanen.</p>
                 <button onClick={onClearData} className="w-full py-4 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Hapus Seluruh Data Rival</button>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="flex items-center gap-6 mb-16">
              <img src={profile.avatar} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-2xl border border-current/5" alt="User" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{profile.name} Instance</h3>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{profile.name.toUpperCase()}@RIVAL.STUDIO</p>
              </div>
            </div>
            <div className="space-y-0">
              <MenuItem title="Layanan Rival" subtitle={profile.isSubscribed ? "STATUS: PRO" : "STATUS: GRATIS"} onClick={() => setActiveSubPage('layanan')} />
              <MenuItem title="Identitas Rival" subtitle="INSTRUKSI & PERSONA SISTEM" onClick={() => setActiveSubPage('identitas')} />
              <MenuItem title="Rival Offline" subtitle={profile.offlineModelDownloaded ? "CORE TERUNDUH (READY)" : "AI OFFLINE TERSEDIA"} onClick={() => setActiveSubPage('offline')} />
              <MenuItem title="Tema & Visual" subtitle={`WARNA ANTARMUKA ${profile.theme.toUpperCase()}`} onClick={() => setActiveSubPage('tema')} />
              <MenuItem title="Tipografi & Skala" subtitle={`FONT ${profile.font.toUpperCase()} • SKALA ${Math.round((profile.uiScale || 1) * 100)}%`} onClick={() => setActiveSubPage('tipografi')} />
              <MenuItem title="Profil Pengguna" subtitle="INFORMASI & AVATAR ANDA" onClick={() => setActiveSubPage('profil')} />
              <MenuItem title="Keamanan & Privasi" subtitle="ENKRIPSI & MANAJEMEN DATA" onClick={() => setActiveSubPage('keamanan')} />
            </div>
            <div className="mt-16 pt-8">
              <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-500 transition-colors">Keluar Dari Sesi</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-inherit relative h-full">
      <div className="max-w-3xl mx-auto px-8 py-16 md:py-24">
        {activeSubPage === 'main' && (
          <header className="mb-16 flex items-center gap-8">
            <button onClick={onBack} className="p-3 -ml-3 hover:bg-current/5 rounded-full transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          </header>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ title: string; subtitle: string; onClick: () => void }> = ({ title, subtitle, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between py-10 border-b border-current/5 group text-left hover:px-4 transition-all">
    <div className="space-y-1.5">
      <h4 className="text-sm font-black uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{subtitle}</p>
    </div>
    <svg className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
  </button>
);

