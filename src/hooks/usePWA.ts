import { useState, useEffect } from 'react';

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
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export type DeviceType = 'ios' | 'android' | 'desktop';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  // We want the install button to be PERMANENTLY visible across devices.
  const [isInstallable, setIsInstallable] = useState(true); 
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    // Detect device type
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    // It's already attached globally, but we attach it here to update React state
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;

    if (promptToUse) {
      try {
        // Show the native install prompt
        await promptToUse.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await promptToUse.userChoice;
        
        if (outcome === 'accepted') {
          // We no longer need the prompt. Clear it up.
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error('Error with PWA prompt:', error);
        setShowFallbackModal(true);
      }
    } else {
      // Fallback for iOS / non-supporting browsers
      setShowFallbackModal(true);
    }
  };

  return { isInstallable, promptInstall, showFallbackModal, setShowFallbackModal, deviceType };
}
