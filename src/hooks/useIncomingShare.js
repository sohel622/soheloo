import { useState, useEffect, useCallback } from 'react';

/**
 * useIncomingShare Hook
 * Listens for incoming shared content from:
 * 1. Web Share Target query params (e.g., ?text=...&url=...&title=...)
 * 2. WebToNative / APK Wrappers query parameters
 * 3. Capacitor (@capacitor/app) appUrlOpen / launch events
 * 4. Android Native Bridge window.handleIncomingShare events
 * 5. PWA Service Worker share target messages
 */
export function useIncomingShare(onShareReceived) {
  const [incomingSharedLink, setIncomingSharedLink] = useState(null);
  const [incomingShareData, setIncomingShareData] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShabnamDmOpen, setIsShabnamDmOpen] = useState(false);

  // Helper to extract valid link/text from raw params or strings
  const extractShareInfo = useCallback((raw) => {
    if (!raw) return null;
    let text = typeof raw === 'string' ? raw : (raw.text || '');
    let url = typeof raw === 'object' ? (raw.url || '') : '';
    let title = typeof raw === 'object' ? (raw.title || '') : '';
    let stream = typeof raw === 'object' ? (raw.stream || '') : '';

    // If url is not given separately, detect url inside text
    if (!url && text) {
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const matched = text.match(urlRegex);
      if (matched && matched.length > 0) {
        url = matched[0];
      }
    }

    const primaryLink = url || text;
    if (!primaryLink && !stream) return null;

    return {
      link: primaryLink,
      url: url || primaryLink,
      text: text,
      title: title,
      stream: stream,
      timestamp: Date.now()
    };
  }, []);

  // Universal handler when share content arrives
  const processIncomingContent = useCallback((data, source = 'external') => {
    const parsed = extractShareInfo(data);
    if (!parsed || !parsed.link) return;

    // Store in global window state and React state
    window.incomingSharedLink = parsed.link;
    window.incomingShareData = parsed;
    setIncomingSharedLink(parsed.link);
    setIncomingShareData(parsed);

    // Show subtle confirmation toast
    if (typeof window.showAppToast === 'function') {
      window.showAppToast('Link received from external app');
    }

    // Open Flashgram Share Modal
    setIsShareModalOpen(true);

    if (typeof onShareReceived === 'function') {
      onShareReceived(parsed);
    }
  }, [extractShareInfo, onShareReceived]);

  useEffect(() => {
    // 1. Check URL Search Parameters (Web Share Target & WebToNative / APK wrappers)
    const handleUrlQueryParams = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlParam = searchParams.get('url') || searchParams.get('link') || searchParams.get('sharedUrl');
        const textParam = searchParams.get('text') || searchParams.get('msg') || searchParams.get('description');
        const titleParam = searchParams.get('title') || searchParams.get('name');

        if (urlParam || textParam) {
          processIncomingContent({
            url: urlParam || '',
            text: textParam || '',
            title: titleParam || ''
          }, 'web-query');

          // Clean URL query params to prevent re-triggering on page refresh
          const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (err) {
        console.warn('Error reading incoming URL params:', err);
      }
    };

    handleUrlQueryParams();

    // 2. Setup Capacitor App Plugin listener (if installed / available)
    let capacitorListener = null;
    const setupCapacitor = async () => {
      try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
          const { App } = window.Capacitor.Plugins;
          // Listen for app open via custom URL scheme or shared link
          capacitorListener = await App.addListener('appUrlOpen', (event) => {
            if (event && event.url) {
              try {
                const parsedUrl = new URL(event.url);
                const text = parsedUrl.searchParams.get('text') || '';
                const url = parsedUrl.searchParams.get('url') || '';
                const title = parsedUrl.searchParams.get('title') || '';
                processIncomingContent({ text, url, title, rawUrl: event.url }, 'capacitor');
              } catch (e) {
                processIncomingContent(event.url, 'capacitor-raw');
              }
            }
          });

          // Check launchUrl if app was cold started via share
          const launchUrl = await App.getLaunchUrl();
          if (launchUrl && launchUrl.url) {
            try {
              const parsedUrl = new URL(launchUrl.url);
              const text = parsedUrl.searchParams.get('text') || '';
              const url = parsedUrl.searchParams.get('url') || '';
              const title = parsedUrl.searchParams.get('title') || '';
              processIncomingContent({ text, url, title, rawUrl: launchUrl.url }, 'capacitor-launch');
            } catch (e) {
              processIncomingContent(launchUrl.url, 'capacitor-launch-raw');
            }
          }
        }
      } catch (e) {
        // Capacitor not loaded or not in Capacitor container
      }
    };
    setupCapacitor();

    // 3. Android Native Bridge / WebView global callback
    window.handleIncomingShare = (payload) => {
      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        processIncomingContent(data, 'android-native-bridge');
      } catch (e) {
        processIncomingContent(payload, 'android-native-bridge');
      }
    };

    // 4. PWA Service Worker postMessage listener (for Web Share Target API)
    const handleServiceWorkerMessage = (event) => {
      if (event.data && (event.data.type === 'INCOMING_SHARE_TARGET' || event.data.action === 'incoming_share')) {
        processIncomingContent(event.data.payload || event.data, 'pwa-share-target');
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if (capacitorListener && typeof capacitorListener.remove === 'function') {
        capacitorListener.remove();
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      delete window.handleIncomingShare;
    };
  }, [processIncomingContent]);

  const openShabnamDmWithLink = (customLink) => {
    const linkToUse = customLink || incomingSharedLink;
    if (linkToUse) {
      setIsShareModalOpen(false);
      setIsShabnamDmOpen(true);
    }
  };

  const closeShareModal = () => setIsShareModalOpen(false);
  const closeShabnamDm = () => setIsShabnamDmOpen(false);

  return {
    incomingSharedLink,
    incomingShareData,
    isShareModalOpen,
    isShabnamDmOpen,
    setIsShareModalOpen,
    setIsShabnamDmOpen,
    openShabnamDmWithLink,
    closeShareModal,
    closeShabnamDm,
    processIncomingContent
  };
}

export default useIncomingShare;
