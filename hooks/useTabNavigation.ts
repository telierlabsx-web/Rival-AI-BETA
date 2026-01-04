
import { useState } from 'react';

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'gallery'>('chat');
  return { activeTab, setActiveTab };
};
