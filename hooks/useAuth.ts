
import { useState } from 'react';

export const useAuth = () => {
  // Set default to true to "remove" the landing/login barrier as requested
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin = (token: string) => {
    localStorage.setItem('rival_token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('rival_token');
    setIsLoggedIn(false);
  };

  return { isLoggedIn, handleLogin, handleLogout };
};
