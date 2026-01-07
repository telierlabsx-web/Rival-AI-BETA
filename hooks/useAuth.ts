import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, loginAnonymously, logout, onAuthStateChanged } from '../lib/firebase';
import type { User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // isLoggedIn dihitung otomatis dari keberadaan object user
  const isLoggedIn = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
      // Jika user menutup popup, tetap stop loading
      setLoading(false);
      throw error;
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await loginAnonymously();
    } catch (error) {
      console.error('Anonymous login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear(); // Bersihkan semua data sisa login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { 
    user, 
    isLoggedIn, 
    loading, 
    handleGoogleLogin, 
    handleAnonymousLogin, 
    handleLogout 
  };
};
