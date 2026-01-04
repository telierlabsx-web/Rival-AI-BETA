
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
  aiAvatar: "https://picsum.photos/seed/rivalai/200/200",
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

  return { userProfile, setUserProfile };
};
