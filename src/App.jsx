import React, { useState } from 'react';
import { useIncomingShare } from './hooks/useIncomingShare';
import { FlashgramShareModal } from './components/FlashgramShareModal';
import { ShabnamDmModal } from './components/ShabnamDmModal';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [shabnamDmLink, setShabnamDmLink] = useState('');

  // Use the incoming share hook to catch intents, Capacitor events, and WebToNative query params
  const {
    incomingSharedLink,
    incomingShareData,
    isShareModalOpen,
    isShabnamDmOpen,
    setIsShareModalOpen,
    setIsShabnamDmOpen,
    openShabnamDmWithLink,
    closeShareModal,
    closeShabnamDm
  } = useIncomingShare((data) => {
    console.log('[Flashgram] External share detected:', data);
  });

  const handleOpenShabnamFromShare = (link) => {
    setShabnamDmLink(link);
    setIsShareModalOpen(false);
    setIsShabnamDmOpen(true);
  };

  const handleShareToFeed = (text) => {
    if (window.showAppToast) {
      window.showAppToast('Posted to Flashgram Community!');
    }
  };

  return (
    <div className="flashgram-app-container">
      {/* Incoming Share Modal */}
      <FlashgramShareModal
        isOpen={isShareModalOpen}
        sharedLink={incomingSharedLink}
        sharedData={incomingShareData}
        onClose={closeShareModal}
        onOpenShabnamDm={handleOpenShabnamFromShare}
        onShareToFeed={handleShareToFeed}
      />

      {/* Shabnam AI DM Screen with prefilled shared link */}
      <ShabnamDmModal
        isOpen={isShabnamDmOpen}
        initialMessage={shabnamDmLink ? `Check out this link: ${shabnamDmLink}` : ''}
        onClose={closeShabnamDm}
      />
    </div>
  );
}

export default App;
