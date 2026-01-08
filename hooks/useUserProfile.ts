import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  avatar: "https://picsum.photos/seed/rivaluser/200/200",
  theme: "white",
  font: "modern",
  fontSize: 100,
  uiScale: 1,
  isSubscribed: false,
  isOfflineMode: false,
  offlineModelDownloaded: false,
  aiName: "Rival",
  aiAvatar: "/74dbe19332370b2fe15b6c9f656a993b (1).jpg", // Default foto AI lu
  aiPersona: "" // Benar-benar kosong sesuai permintaan user
};

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rival_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('rival_profile', JSON.stringify(userProfile));
    document.documentElement.style.setProperty('--user-font-size', `${userProfile.fontSize || 100}%`);
    document.documentElement.style.setProperty('--user-ui-scale', `${userProfile.uiScale || 1}`);
  }, [userProfile]);

  // Function buat update AI avatar
  const updateAIAvatar = (photoUrl: string) => {
    setUserProfile(prev => ({
      ...prev,
      aiAvatar: photoUrl
    }));
  };

  // Function buat update user avatar
  const updateUserAvatar = (photoUrl: string) => {
    setUserProfile(prev => ({
      ...prev,
      avatar: photoUrl
    }));
  };

  return { 
    userProfile, 
    setUserProfile,
    updateAIAvatar,
    updateUserAvatar
  };
};

