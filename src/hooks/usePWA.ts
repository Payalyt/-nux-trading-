import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to catch the event early before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile and preserve the event
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    // Dispatch custom event in case listeners need notification
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
}

export type FallbackReason = 'iframe' | 'ios' | 'browser' | null;

export interface FallbackInfo {
  show: boolean;
  reason: FallbackReason;
  title: string;
  message: string;
  canOpenNewTab: boolean;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [fallbackInfo, setFallbackInfo] = useState<FallbackInfo>({
    show: false,
    reason: null,
    title: '',
    message: '',
    canOpenNewTab: false,
  });

  useEffect(() => {
    // Check if running inside an iframe
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handlePromptReady = () => {
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsInstallable(false);
      setFallbackInfo((prev) => ({ ...prev, show: false }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissFallback = useCallback(() => {
    setFallbackInfo((prev) => ({ ...prev, show: false }));
  }, []);

  const openInNewTab = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
      dismissFallback();
    }
  }, [dismissFallback]);

  const installPWA = useCallback(async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;

    if (promptToUse) {
      try {
        // Execute prompt directly upon user gesture
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          setIsInstallable(false);
          setFallbackInfo((prev) => ({ ...prev, show: false }));
        }
      } catch (error) {
        console.error('Error triggering PWA prompt:', error);
      }
      return;
    }

    // If native prompt is not available, detect context and provide helpful guidance
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isIOS = /iphone|ipad|ipod/.test(ua);

    if (isInIframe) {
      setFallbackInfo({
        show: true,
        reason: 'iframe',
        title: 'Install in Main Window',
        message: 'Browser security restricts native PWA installation inside preview frames. Open in a new tab or use browser menu (⋮ → Install App).',
        canOpenNewTab: true,
      });
    } else if (isIOS) {
      setFallbackInfo({
        show: true,
        reason: 'ios',
        title: 'Install on iOS Safari',
        message: 'Tap the Share button (⎋) at the bottom of Safari, then choose "Add to Home Screen" to install the app.',
        canOpenNewTab: false,
      });
    } else {
      setFallbackInfo({
        show: true,
        reason: 'browser',
        title: 'Install via Browser Menu',
        message: 'Click the install icon (⊕) in your browser address bar or click menu (⋮) → "Install NUX Trading" / "Save and Share".',
        canOpenNewTab: false,
      });
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    deferredPrompt,
    fallbackInfo,
    installPWA,
    promptInstall: installPWA, // Alias for backward compatibility
    dismissFallback,
    openInNewTab,
  };
}
