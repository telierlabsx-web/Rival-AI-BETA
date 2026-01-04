
import React from 'react';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black p-8">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            <span className="text-black font-black text-2xl tracking-tighter">R</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Rival <span className="opacity-30">AI Assistant</span></h1>
        </div>
        
        <button 
          onClick={() => onLogin('mock_token')}
          className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10"
        >
          Masuk ke Sistem
        </button>
        
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">v1.0.4 Beta Deployment • Global access granted</p>
      </div>
    </div>
  );
};
