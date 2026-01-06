import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ProfilePage } from './components/ProfilePage';
import { GalleryPage } from './components/GalleryPage';
import { LoginPage } from './components/LoginPage';
import { OfflineDownloadPopup } from './components/OfflineDownloadPopup';
import { useUserProfile } from './hooks/useUserProfile';
import { useImageUsage } from './hooks/useImageUsage';
import { useSessions } from './hooks/useSessions';
import { useTabNavigation } from './hooks/useTabNavigation';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { userProfile, setUserProfile } = useUserProfile();
  const { checkImageLimit, incrementImageUsage } = useImageUsage(userProfile.isSubscribed);
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    createNewChat,
    updateSessionMessages,
    deleteSession,
    clearAllData
  } = useSessions();
  const { activeTab, setActiveTab } = useTabNavigation();
  const { isLoggedIn, loading, user, handleGoogleLogin, handleAnonymousLogin, handleLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('rival_seen_offline_popup');
    if (!userProfile.offlineModelDownloaded && !hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowOfflinePopup(true);
        localStorage.setItem('rival_seen_offline_popup', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userProfile.offlineModelDownloaded]);

  const handleDownloadOffline = () => {
    setUserProfile({ ...userProfile, offlineModelDownloaded: true, isOfflineMode: true });
    setShowOfflinePopup(false);
  };

  const handleCancelOffline = () => {
    setShowOfflinePopup(false);
  };

  const navigateTo = (tab: 'chat' | 'profile' | 'gallery') => {
    setActiveTab(tab);
    if (tab === 'profile' || tab === 'gallery' || window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white font-black text-xl uppercase tracking-widest animate-pulse">
          Loading Rival...
        </div>
      </div>
    );
  }

  if (!isLoggedIn && activeTab === 'profile') {
    return (
      <LoginPage 
        onGoogleLogin={handleGoogleLogin}
        onAnonymousLogin={handleAnonymousLogin}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden theme-${userProfile.theme} font-${userProfile.font} transition-colors duration-500`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          navigateTo('chat');
        }}
        onNewChat={() => {
          createNewChat();
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onDeleteSession={deleteSession}
        userProfile={userProfile}
        onProfileClick={() => navigateTo('profile')}
        onGalleryClick={() => navigateTo('gallery')}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-inherit">
        {activeTab === 'chat' ? (
          <ChatInterface 
            key={currentSessionId || 'empty'}
            session={currentSession}
            profile={userProfile}
            onUpdateMessages={(msgs) => currentSessionId && updateSessionMessages(currentSessionId, msgs)}
            onUpdateProfile={setUserProfile}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onNewChat={createNewChat}
            checkImageLimit={checkImageLimit}
            incrementImageUsage={incrementImageUsage}
          />
        ) : activeTab === 'profile' ? (
          <ProfilePage 
            profile={userProfile} 
            onUpdateProfile={setUserProfile}
            onBack={() => {
              setActiveTab('chat');
              if (window.innerWidth > 1024) setIsSidebarOpen(true);
            }}
            onClearData={clearAllData}
            onLogout={async () => {
              await handleLogout();
              window.location.reload();
            }}
          />
        ) : (
          <GalleryPage 
            sessions={sessions}
            profile={userProfile}
            onBack={() => {
              setActiveTab('chat');
              if (window.innerWidth > 1024) setIsSidebarOpen(true);
            }}
            onUpdateSessions={setSessions}
          />
        )}
      </main>

      {showOfflinePopup && (
        <OfflineDownloadPopup 
          isDark={userProfile.theme === 'black' || userProfile.theme === 'slate'}
          onDownload={handleDownloadOffline}
          onCancel={handleCancelOffline}
        />
      )}
    </div>
  );
};

export default App;
