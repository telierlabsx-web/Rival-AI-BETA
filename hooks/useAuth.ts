import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, loginAnonymously, logout, onAuthStateChanged } from '../lib/firebase';
import type { User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await loginAnonymously();
    } catch (error) {
      console.error('Anonymous login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('rival_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, isLoggedIn, loading, handleGoogleLogin, handleAnonymousLogin, handleLogout };
};
