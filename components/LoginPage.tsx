import React, { useState } from 'react';

interface LoginPageProps {
  onGoogleLogin: () => Promise<void>;
  onAnonymousLogin: () => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoogleLogin, onAnonymousLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await onGoogleLogin();
    } catch (error) {
      alert('Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await onAnonymousLogin();
    } catch (error) {
      alert('Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/aa79bf86c26ff3fbd3ceb1d46c3d6c22.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      </div>

      <div className="relative z-10 max-w-md w-full px-8 text-center space-y-10">
        <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-8">
          <span className="text-white font-black text-3xl tracking-tighter">R</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white uppercase tracking-tight leading-none">
            Rival <span className="text-white/40">AI</span>
          </h1>
          <p className="text-sm font-bold text-white/50 uppercase tracking-[0.3em]">Intelligence Assistant</p>
        </div>

        <div className="space-y-4 pt-8">
          <button 
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Memproses...' : 'Login dengan Google'}
          </button>

          <button 
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full bg-white/10 backdrop-blur-xl text-white border border-white/20 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] hover:bg-white/20 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {loading ? 'Memproses...' : 'Login Anonim'}
          </button>
        </div>

        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] pt-8">
          v1.0.4 Beta • Secured Connection
        </p>
      </div>
    </div>
  );
};
