import React, { useState } from 'react';

interface LoginPageProps {
  onGoogleLogin: () => Promise<void>;
  onAnonymousLogin: () => Promise<void>;
  onBack?: () => void; // TAMBAH INI - optional callback buat back
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onGoogleLogin, 
  onAnonymousLogin,
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await onGoogleLogin();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      await onAnonymousLogin();
    } catch (error) {
      console.error('Anonymous login failed:', error);
      alert('Login gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-end relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/aa79bf86c26ff3fbd3ceb1d46c3d6c22.jpg')`,
        }}
      />
      
      {/* Gradient Overlay dari bawah */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* TOMBOL BACK - KIRI ATAS */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 pb-12 space-y-8">
        
        {/* Logo Icon - Bulan Sabit */}
        <div className="flex justify-center mb-10">
          <img 
            src="/file_00000000203871fd8b28feef81a16b24.png" 
            alt="Logo"
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Hero Text - Simple & Clean */}
        <div className="text-center mb-12">
          <h1 className="text-lg md:text-xl font-bold text-white/80 uppercase tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Intelligence Assistant
          </h1>
        </div>

        {/* Login Buttons */}
        <div className="space-y-3 pt-6">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-[1.5rem] font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="uppercase tracking-widest text-xs">Loading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="uppercase tracking-widest text-xs font-black">Login dengan Google</span>
              </>
            )}
          </button>

          {/* Anonymous Login Button */}
          <button
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 text-white rounded-[1.5rem] font-bold text-sm transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 backdrop-blur-xl shadow-xl"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="uppercase tracking-widest text-xs">Loading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="uppercase tracking-widest text-xs font-black">Login Anonim</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] pt-4">
          V1.0.4 Beta • Secured Connection
        </p>
      </div>
    </div>
  );
};
